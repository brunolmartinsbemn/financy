import { gql } from '@apollo/client'

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
  }
`

const CATEGORY_FIELDS = gql`
  fragment CategoryFields on Category {
    id
    title
    description
    icon
    color
    transactionCount
    totalAmount
  }
`

const TRANSACTION_FIELDS = gql`
  fragment TransactionFields on Transaction {
    id
    description
    amount
    type
    date
    category {
      id
      title
      icon
      color
    }
  }
`

export const ME = gql`
  ${USER_FIELDS}
  query Me {
    me {
      ...UserFields
    }
  }
`

export const LOGIN = gql`
  ${USER_FIELDS}
  mutation Login($data: LoginInput!) {
    login(data: $data) {
      token
      user {
        ...UserFields
      }
    }
  }
`

export const REGISTER = gql`
  ${USER_FIELDS}
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      token
      user {
        ...UserFields
      }
    }
  }
`

export const UPDATE_PROFILE = gql`
  ${USER_FIELDS}
  mutation UpdateProfile($data: UpdateProfileInput!) {
    updateProfile(data: $data) {
      ...UserFields
    }
  }
`

export const CATEGORIES = gql`
  ${CATEGORY_FIELDS}
  query Categories {
    categories {
      ...CategoryFields
    }
  }
`

export const CREATE_CATEGORY = gql`
  ${CATEGORY_FIELDS}
  mutation CreateCategory($data: CategoryInput!) {
    createCategory(data: $data) {
      ...CategoryFields
    }
  }
`

export const UPDATE_CATEGORY = gql`
  ${CATEGORY_FIELDS}
  mutation UpdateCategory($id: ID!, $data: CategoryInput!) {
    updateCategory(id: $id, data: $data) {
      ...CategoryFields
    }
  }
`

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

export const TRANSACTIONS = gql`
  ${TRANSACTION_FIELDS}
  query Transactions($filter: TransactionFilter, $page: Int, $perPage: Int) {
    transactions(filter: $filter, page: $page, perPage: $perPage) {
      items {
        ...TransactionFields
      }
      total
      page
      perPage
      totalPages
    }
  }
`

export const SUMMARY = gql`
  query Summary($period: String) {
    summary(period: $period) {
      balance
      monthIncome
      monthExpense
    }
  }
`

export const CREATE_TRANSACTION = gql`
  ${TRANSACTION_FIELDS}
  mutation CreateTransaction($data: TransactionInput!) {
    createTransaction(data: $data) {
      ...TransactionFields
    }
  }
`

export const UPDATE_TRANSACTION = gql`
  ${TRANSACTION_FIELDS}
  mutation UpdateTransaction($id: ID!, $data: TransactionInput!) {
    updateTransaction(id: $id, data: $data) {
      ...TransactionFields
    }
  }
`

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`

/** Queries that depend on transactions/categories and must refresh after any mutation. */
export const FINANCE_QUERIES = ['Transactions', 'Summary', 'Categories']
