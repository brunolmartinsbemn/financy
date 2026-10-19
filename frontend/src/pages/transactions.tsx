import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Plus, Search, SquarePen, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tag } from '@/components/ui/tag'
import { IconButton } from '@/components/ui/icon-button'
import { Pagination } from '@/components/ui/pagination'
import { CategoryIcon } from '@/components/category-icon'
import { TransactionTypeBadge } from '@/components/transaction-type'
import { TransactionDialog } from '@/components/transaction-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { CATEGORIES, DELETE_TRANSACTION, FINANCE_QUERIES, TRANSACTIONS } from '@/graphql/operations'
import type { Category, Transaction, TransactionFilter, TransactionPage, TransactionType } from '@/graphql/types'
import { formatCurrency, formatPeriod, formatShortDate, recentPeriods } from '@/lib/format'
import { getErrorMessage } from '@/lib/errors'

const PER_PAGE = 10
const SEARCH_DEBOUNCE_MS = 300

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])
  return debounced
}

export function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TransactionType | ''>('')
  const [categoryId, setCategoryId] = useState('')
  const [period, setPeriod] = useState('')
  const [page, setPage] = useState(1)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)

  /** Filters always restart the listing at the first page. */
  function withPageReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS)

  const filter: TransactionFilter = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(type && { type }),
    ...(categoryId && { categoryId }),
    ...(period && { period }),
  }

  const { data, loading, previousData } = useQuery<{ transactions: TransactionPage }>(TRANSACTIONS, {
    variables: { filter, page, perPage: PER_PAGE },
  })
  const { data: categoriesData } = useQuery<{ categories: Category[] }>(CATEGORIES)
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION, {
    refetchQueries: FINANCE_QUERIES,
    awaitRefetchQueries: true,
  })

  const result = (data ?? previousData)?.transactions
  const items = result?.items ?? []
  const firstItem = result && result.total > 0 ? (result.page - 1) * result.perPage + 1 : 0
  const lastItem = items.length > 0 ? firstItem + items.length - 1 : 0

  function openCreate() {
    setEditing(null)
    setIsFormOpen(true)
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction)
    setIsFormOpen(true)
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteTransaction({ variables: { id: deleting.id } })
      toast.success('Transação excluída')
      if (items.length === 1 && page > 1) setPage(page - 1)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <>
      <PageHeader
        title="Transações"
        description="Gerencie todas as suas transações financeiras"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus /> Nova transação
          </Button>
        }
      />

      <Card className="mb-8 grid grid-cols-1 gap-4 px-6 pt-5 pb-6 md:grid-cols-4">
        <Field label="Buscar" htmlFor="filter-search">
          <Input
            id="filter-search"
            icon={<Search />}
            placeholder="Buscar por descrição"
            value={search}
            onChange={(event) => withPageReset(setSearch)(event.target.value)}
          />
        </Field>
        <Field label="Tipo" htmlFor="filter-type">
          <Select id="filter-type" value={type} onChange={(event) => withPageReset(setType)(event.target.value as TransactionType | '')}>
            <option value="">Todos</option>
            <option value="INCOME">Entrada</option>
            <option value="EXPENSE">Saída</option>
          </Select>
        </Field>
        <Field label="Categoria" htmlFor="filter-category">
          <Select id="filter-category" value={categoryId} onChange={(event) => withPageReset(setCategoryId)(event.target.value)}>
            <option value="">Todas</option>
            {categoriesData?.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Período" htmlFor="filter-period">
          <Select id="filter-period" value={period} onChange={(event) => withPageReset(setPeriod)(event.target.value)}>
            <option value="">Todos</option>
            {recentPeriods().map((value) => (
              <option key={value} value={value}>
                {formatPeriod(value)}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-medium tracking-wide text-gray-500 uppercase">
                <th className="px-6 py-5 font-medium">Descrição</th>
                <th className="px-6 py-5 text-center font-medium">Data</th>
                <th className="px-6 py-5 text-center font-medium">Categoria</th>
                <th className="px-6 py-5 text-center font-medium">Tipo</th>
                <th className="px-6 py-5 text-right font-medium">Valor</th>
                <th className="px-6 py-5 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    {loading ? 'Carregando...' : 'Nenhuma transação encontrada.'}
                  </td>
                </tr>
              ) : (
                items.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <CategoryIcon icon={transaction.category?.icon} color={transaction.category?.color} />
                        <span className="font-medium text-gray-800">{transaction.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{formatShortDate(transaction.date)}</td>
                    <td className="px-6 py-4 text-center">
                      <Tag color={transaction.category?.color}>{transaction.category?.title ?? 'Sem categoria'}</Tag>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <TransactionTypeBadge type={transaction.type} />
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold whitespace-nowrap text-gray-800">
                      {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <IconButton variant="danger" aria-label="Excluir transação" onClick={() => setDeleting(transaction)}>
                          <Trash />
                        </IconButton>
                        <IconButton aria-label="Editar transação" onClick={() => openEdit(transaction)}>
                          <SquarePen />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <span className="text-sm text-gray-700">
            {firstItem} a {lastItem} <span className="mx-1 text-gray-300">|</span> {result?.total ?? 0}{' '}
            {result?.total === 1 ? 'resultado' : 'resultados'}
          </span>
          {result && <Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}
        </div>
      </Card>

      <TransactionDialog open={isFormOpen} onOpenChange={setIsFormOpen} transaction={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir transação"
        description={`Tem certeza que deseja excluir "${deleting?.description ?? ''}"? Essa ação não pode ser desfeita.`}
        onConfirm={handleDelete}
      />
    </>
  )
}
