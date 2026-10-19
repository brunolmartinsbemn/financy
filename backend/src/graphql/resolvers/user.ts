import bcrypt from 'bcryptjs'
import { z } from 'zod'
import type { User } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { signToken } from '../../lib/auth'
import { badInput, unauthenticated, parseInput } from '../../lib/errors'
import { requireUser, type Context } from '../../context'

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
})

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome'),
})

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: Context) => {
      const user = await prisma.user.findUnique({ where: { id: requireUser(ctx) } })
      if (!user) throw unauthenticated()
      return user
    },
  },

  Mutation: {
    register: async (_: unknown, args: { data: unknown }) => {
      const data = parseInput(registerSchema, args.data)

      const existing = await prisma.user.findUnique({ where: { email: data.email } })
      if (existing) throw badInput('Este e-mail já está em uso')

      const user = await prisma.user.create({
        data: { name: data.name, email: data.email, passwordHash: await bcrypt.hash(data.password, 10) },
      })

      return { token: signToken(user.id), user }
    },

    login: async (_: unknown, args: { data: unknown }) => {
      const data = parseInput(loginSchema, args.data)

      const user = await prisma.user.findUnique({ where: { email: data.email } })
      const valid = user && (await bcrypt.compare(data.password, user.passwordHash))
      if (!user || !valid) throw badInput('E-mail ou senha inválidos')

      return { token: signToken(user.id), user }
    },

    updateProfile: async (_: unknown, args: { data: unknown }, ctx: Context) => {
      const data = parseInput(updateProfileSchema, args.data)
      return prisma.user.update({ where: { id: requireUser(ctx) }, data: { name: data.name } })
    },
  },

  User: {
    createdAt: (user: User) => user.createdAt.toISOString(),
  },
}
