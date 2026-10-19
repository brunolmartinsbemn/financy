export type TransactionType = 'INCOME' | 'EXPENSE'

export type CategoryColor = 'green' | 'blue' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow'

export interface User {
  id: string
  name: string
  email: string
}

export interface Category {
  id: string
  title: string
  description: string | null
  icon: string
  color: CategoryColor
  transactionCount: number
  totalAmount: number
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  date: string
  category: Pick<Category, 'id' | 'title' | 'icon' | 'color'> | null
}

export interface TransactionPage {
  items: Transaction[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface Summary {
  balance: number
  monthIncome: number
  monthExpense: number
}

export interface CategoryInput {
  title: string
  description?: string | null
  icon: string
  color: CategoryColor
}

export interface TransactionInput {
  description: string
  amount: number
  type: TransactionType
  date: string
  categoryId?: string | null
}

export interface TransactionFilter {
  search?: string
  type?: TransactionType
  categoryId?: string
  period?: string
}
