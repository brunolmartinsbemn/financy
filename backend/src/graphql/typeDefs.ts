export const typeDefs = /* GraphQL */ `
  enum TransactionType {
    INCOME
    EXPENSE
  }

  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Category {
    id: ID!
    title: String!
    description: String
    icon: String!
    color: String!
    createdAt: String!
    "Number of transactions linked to this category"
    transactionCount: Int!
    "Sum of the linked transactions amounts, in cents"
    totalAmount: Int!
  }

  type Transaction {
    id: ID!
    description: String!
    "Amount in cents, always positive"
    amount: Int!
    type: TransactionType!
    "ISO date (YYYY-MM-DD)"
    date: String!
    category: Category
    createdAt: String!
  }

  type TransactionPage {
    items: [Transaction!]!
    total: Int!
    page: Int!
    perPage: Int!
    totalPages: Int!
  }

  type Summary {
    "All-time income minus expenses, in cents"
    balance: Int!
    monthIncome: Int!
    monthExpense: Int!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    name: String!
  }

  input CategoryInput {
    title: String!
    description: String
    icon: String!
    color: String!
  }

  input TransactionInput {
    description: String!
    amount: Int!
    type: TransactionType!
    date: String!
    categoryId: ID
  }

  input TransactionFilter {
    search: String
    type: TransactionType
    categoryId: ID
    "Month in YYYY-MM format"
    period: String
  }

  type Query {
    me: User!
    categories: [Category!]!
    transactions(filter: TransactionFilter, page: Int = 1, perPage: Int = 10): TransactionPage!
    "Month in YYYY-MM format, defaults to the current month"
    summary(period: String): Summary!
  }

  type Mutation {
    register(data: RegisterInput!): AuthPayload!
    login(data: LoginInput!): AuthPayload!
    updateProfile(data: UpdateProfileInput!): User!

    createCategory(data: CategoryInput!): Category!
    updateCategory(id: ID!, data: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    createTransaction(data: TransactionInput!): Transaction!
    updateTransaction(id: ID!, data: TransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`
