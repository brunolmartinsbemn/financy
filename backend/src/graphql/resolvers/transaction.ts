import { z } from 'zod'
import type { Prisma, Transaction } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { badInput, notFound, parseInput } from '../../lib/errors'
import { requireUser, type Context } from '../../context'

const transactionSchema = z.object({
  description: z.string().trim().min(1, 'Informe a descrição'),
  amount: z.number().int().positive('O valor deve ser maior que zero'),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  categoryId: z.string().nullish().transform((value) => value || null),
})

const filterSchema = z
  .object({
    search: z.string().trim().nullish(),
    type: z.enum(['INCOME', 'EXPENSE']).nullish(),
    categoryId: z.string().nullish(),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Período inválido').nullish(),
  })
  .nullish()

const MAX_PER_PAGE = 100

/** Returns the [start, end) UTC range for a YYYY-MM period. */
export function periodRange(period: string) {
  const [year, month] = period.split('-').map(Number)
  return { gte: new Date(Date.UTC(year, month - 1, 1)), lt: new Date(Date.UTC(year, month, 1)) }
}

export function currentPeriod() {
  return new Date().toISOString().slice(0, 7)
}

async function assertCategoryOwnership(categoryId: string | null, userId: string) {
  if (!categoryId) return
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } })
  if (!category) throw notFound('Categoria')
}

async function findOwnedTransaction(id: string, userId: string) {
  const transaction = await prisma.transaction.findFirst({ where: { id, userId } })
  if (!transaction) throw notFound('Transação')
  return transaction
}

function toData(data: z.infer<typeof transactionSchema>) {
  return { ...data, date: new Date(`${data.date}T00:00:00.000Z`) }
}

export const transactionResolvers = {
  Query: {
    transactions: async (
      _: unknown,
      args: { filter?: unknown; page?: number; perPage?: number },
      ctx: Context,
    ) => {
      const userId = requireUser(ctx)
      const filter = parseInput(filterSchema, args.filter)
      const page = Math.max(1, args.page ?? 1)
      const perPage = Math.min(MAX_PER_PAGE, Math.max(1, args.perPage ?? 10))

      const where: Prisma.TransactionWhereInput = {
        userId,
        ...(filter?.search && { description: { contains: filter.search } }),
        ...(filter?.type && { type: filter.type }),
        ...(filter?.categoryId && { categoryId: filter.categoryId }),
        ...(filter?.period && { date: periodRange(filter.period) }),
      }

      const [items, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: { category: true },
          orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.transaction.count({ where }),
      ])

      return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) }
    },

    summary: async (_: unknown, args: { period?: string | null }, ctx: Context) => {
      const userId = requireUser(ctx)
      const period = args.period ?? currentPeriod()
      if (!/^\d{4}-\d{2}$/.test(period)) throw badInput('Período inválido')

      const [allTime, month] = await Promise.all([
        prisma.transaction.groupBy({ by: ['type'], where: { userId }, _sum: { amount: true } }),
        prisma.transaction.groupBy({
          by: ['type'],
          where: { userId, date: periodRange(period) },
          _sum: { amount: true },
        }),
      ])

      const sumOf = (rows: typeof allTime, type: string) => rows.find((r) => r.type === type)?._sum.amount ?? 0

      return {
        balance: sumOf(allTime, 'INCOME') - sumOf(allTime, 'EXPENSE'),
        monthIncome: sumOf(month, 'INCOME'),
        monthExpense: sumOf(month, 'EXPENSE'),
      }
    },
  },

  Mutation: {
    createTransaction: async (_: unknown, args: { data: unknown }, ctx: Context) => {
      const userId = requireUser(ctx)
      const data = parseInput(transactionSchema, args.data)
      await assertCategoryOwnership(data.categoryId, userId)
      return prisma.transaction.create({ data: { ...toData(data), userId }, include: { category: true } })
    },

    updateTransaction: async (_: unknown, args: { id: string; data: unknown }, ctx: Context) => {
      const userId = requireUser(ctx)
      const data = parseInput(transactionSchema, args.data)
      await findOwnedTransaction(args.id, userId)
      await assertCategoryOwnership(data.categoryId, userId)
      return prisma.transaction.update({ where: { id: args.id }, data: toData(data), include: { category: true } })
    },

    deleteTransaction: async (_: unknown, args: { id: string }, ctx: Context) => {
      const userId = requireUser(ctx)
      await findOwnedTransaction(args.id, userId)
      await prisma.transaction.delete({ where: { id: args.id } })
      return true
    },
  },

  Transaction: {
    date: (transaction: Transaction) => transaction.date.toISOString().slice(0, 10),
    createdAt: (transaction: Transaction) => transaction.createdAt.toISOString(),
  },
}
