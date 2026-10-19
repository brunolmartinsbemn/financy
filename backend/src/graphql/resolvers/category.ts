import { z } from 'zod'
import type { Category } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { notFound, parseInput } from '../../lib/errors'
import { requireUser, type Context } from '../../context'

export const CATEGORY_ICONS = [
  'briefcase-business', 'car-front', 'heart-pulse', 'piggy-bank', 'shopping-cart', 'ticket', 'tool-case', 'utensils',
  'paw-print', 'house', 'gift', 'dumbbell', 'book-open', 'baggage-claim', 'mailbox', 'receipt-text',
] as const

export const CATEGORY_COLORS = ['green', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow'] as const

const categorySchema = z.object({
  title: z.string().trim().min(1, 'Informe o título'),
  description: z.string().trim().nullish().transform((value) => value || null),
  icon: z.enum(CATEGORY_ICONS, { message: 'Ícone inválido' }),
  color: z.enum(CATEGORY_COLORS, { message: 'Cor inválida' }),
})

type CategoryWithStats = Category & { transactionCount?: number; totalAmount?: number }

async function findOwnedCategory(id: string, userId: string) {
  const category = await prisma.category.findFirst({ where: { id, userId } })
  if (!category) throw notFound('Categoria')
  return category
}

async function categoryStats(categoryId: string) {
  const result = await prisma.transaction.aggregate({
    where: { categoryId },
    _count: true,
    _sum: { amount: true },
  })
  return { transactionCount: result._count, totalAmount: result._sum.amount ?? 0 }
}

export const categoryResolvers = {
  Query: {
    categories: async (_: unknown, __: unknown, ctx: Context) => {
      const userId = requireUser(ctx)

      const [categories, stats] = await Promise.all([
        prisma.category.findMany({ where: { userId }, orderBy: { title: 'asc' } }),
        prisma.transaction.groupBy({
          by: ['categoryId'],
          where: { userId, categoryId: { not: null } },
          _count: true,
          _sum: { amount: true },
        }),
      ])

      const statsById = new Map(stats.map((s) => [s.categoryId, s]))

      return categories.map((category) => ({
        ...category,
        transactionCount: statsById.get(category.id)?._count ?? 0,
        totalAmount: statsById.get(category.id)?._sum.amount ?? 0,
      }))
    },
  },

  Mutation: {
    createCategory: async (_: unknown, args: { data: unknown }, ctx: Context) => {
      const userId = requireUser(ctx)
      const data = parseInput(categorySchema, args.data)
      return prisma.category.create({ data: { ...data, userId } })
    },

    updateCategory: async (_: unknown, args: { id: string; data: unknown }, ctx: Context) => {
      const userId = requireUser(ctx)
      const data = parseInput(categorySchema, args.data)
      await findOwnedCategory(args.id, userId)
      return prisma.category.update({ where: { id: args.id }, data })
    },

    deleteCategory: async (_: unknown, args: { id: string }, ctx: Context) => {
      const userId = requireUser(ctx)
      await findOwnedCategory(args.id, userId)
      await prisma.category.delete({ where: { id: args.id } })
      return true
    },
  },

  Category: {
    createdAt: (category: Category) => category.createdAt.toISOString(),
    transactionCount: async (category: CategoryWithStats) =>
      category.transactionCount ?? (await categoryStats(category.id)).transactionCount,
    totalAmount: async (category: CategoryWithStats) =>
      category.totalAmount ?? (await categoryStats(category.id)).totalAmount,
  },
}
