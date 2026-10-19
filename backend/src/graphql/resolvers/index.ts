import { userResolvers } from './user'
import { categoryResolvers } from './category'
import { transactionResolvers } from './transaction'

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...categoryResolvers.Query,
    ...transactionResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...transactionResolvers.Mutation,
  },
  User: userResolvers.User,
  Category: categoryResolvers.Category,
  Transaction: transactionResolvers.Transaction,
}
