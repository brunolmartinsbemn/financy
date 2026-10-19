import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { ChevronRight, CircleArrowDown, CircleArrowUp, Plus, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { CategoryIcon } from '@/components/category-icon'
import { TransactionDialog } from '@/components/transaction-dialog'
import { CATEGORIES, SUMMARY, TRANSACTIONS } from '@/graphql/operations'
import type { Category, Summary, TransactionPage } from '@/graphql/types'
import { currentPeriod, formatCurrency, formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const RECENT_LIMIT = 5
const TOP_CATEGORIES = 5

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value?: number }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <span className="flex items-center gap-3 text-xs font-medium tracking-wide text-gray-500 uppercase [&_svg]:size-5">
        {icon}
        {label}
      </span>
      <strong className="text-[28px] leading-8 font-bold text-gray-800">
        {value === undefined ? '—' : formatCurrency(value)}
      </strong>
    </Card>
  )
}

function SectionHeader({ title, to, linkLabel }: { title: string; to: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
      <h2 className="text-xs font-medium tracking-wide text-gray-500 uppercase">{title}</h2>
      <Link to={to} className="flex items-center gap-1 text-sm font-medium text-brand-base hover:underline">
        {linkLabel} <ChevronRight className="size-4" />
      </Link>
    </div>
  )
}

export function DashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: summaryData } = useQuery<{ summary: Summary }>(SUMMARY, { variables: { period: currentPeriod() } })
  const { data: transactionsData, loading } = useQuery<{ transactions: TransactionPage }>(TRANSACTIONS, {
    variables: { page: 1, perPage: RECENT_LIMIT },
  })
  const { data: categoriesData } = useQuery<{ categories: Category[] }>(CATEGORIES)

  const summary = summaryData?.summary
  const transactions = transactionsData?.transactions.items ?? []
  const topCategories = [...(categoriesData?.categories ?? [])]
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, TOP_CATEGORIES)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SummaryCard icon={<Wallet className="text-purple-base" />} label="Saldo total" value={summary?.balance} />
        <SummaryCard
          icon={<CircleArrowUp className="text-success" />}
          label="Receitas do mês"
          value={summary?.monthIncome}
        />
        <SummaryCard
          icon={<CircleArrowDown className="text-danger" />}
          label="Despesas do mês"
          value={summary?.monthExpense}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="Transações recentes" to="/transacoes" linkLabel="Ver todas" />

          {transactions.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-500">
              {loading ? 'Carregando...' : 'Nenhuma transação cadastrada ainda.'}
            </p>
          ) : (
            <ul>
              {transactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="grid grid-cols-[1fr_auto_160px] items-center gap-4 border-b border-gray-200 px-6 py-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <CategoryIcon icon={transaction.category?.icon} color={transaction.category?.color} />
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-base font-medium text-gray-800">{transaction.description}</span>
                      <span className="text-sm text-gray-600">{formatShortDate(transaction.date)}</span>
                    </div>
                  </div>
                  <Tag color={transaction.category?.color}>{transaction.category?.title ?? 'Sem categoria'}</Tag>
                  <span className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-800">
                    {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    {transaction.type === 'INCOME' ? (
                      <CircleArrowUp className="size-4 text-success" />
                    ) : (
                      <CircleArrowDown className="size-4 text-danger" />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className={cn('flex justify-center px-6 py-5', transactions.length === 0 && 'border-t border-gray-200')}>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-base hover:underline"
            >
              <Plus className="size-4" /> Nova transação
            </button>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Categorias" to="/categorias" linkLabel="Gerenciar" />
          {topCategories.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-500">Nenhuma categoria cadastrada.</p>
          ) : (
            <ul className="flex flex-col gap-5 p-6">
              {topCategories.map((category) => (
                <li key={category.id} className="flex items-center gap-2">
                  <span className="mr-auto min-w-0 truncate">
                    <Tag color={category.color}>{category.title}</Tag>
                  </span>
                  <span className="text-sm text-gray-600">
                    {category.transactionCount} {category.transactionCount === 1 ? 'item' : 'itens'}
                  </span>
                  <span className="w-24 text-right text-sm font-semibold text-gray-800">
                    {formatCurrency(category.totalAmount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <TransactionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
