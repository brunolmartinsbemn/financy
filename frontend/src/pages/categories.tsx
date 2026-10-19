import { useState, type ReactNode } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { ArrowUpDown, Plus, SquarePen, Tag as TagIcon, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tag } from '@/components/ui/tag'
import { IconButton } from '@/components/ui/icon-button'
import { CATEGORY_ICONS, CategoryIcon } from '@/components/category-icon'
import { CategoryDialog } from '@/components/category-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { CATEGORIES, DELETE_CATEGORY, FINANCE_QUERIES } from '@/graphql/operations'
import type { Category } from '@/graphql/types'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

const iconColors: Record<Category['color'], string> = {
  green: 'text-green-base',
  blue: 'text-blue-base',
  purple: 'text-purple-base',
  pink: 'text-pink-base',
  red: 'text-red-base',
  orange: 'text-orange-base',
  yellow: 'text-yellow-base',
}

function CategoryGlyph({ category }: { category: Category | null }) {
  const Icon = (category && CATEGORY_ICONS[category.icon]) || TagIcon
  return <Icon className={category ? iconColors[category.color] : 'text-gray-400'} />
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <Card className="flex items-start gap-4 p-6 [&>svg]:mt-1.5 [&>svg]:size-6 [&>svg]:shrink-0">
      {icon}
      <div className="flex min-w-0 flex-col gap-2">
        <strong className="truncate text-[28px] leading-8 font-bold text-gray-800">{value}</strong>
        <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">{label}</span>
      </div>
    </Card>
  )
}

export function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const { data, loading } = useQuery<{ categories: Category[] }>(CATEGORIES)
  const [deleteCategory] = useMutation(DELETE_CATEGORY, { refetchQueries: FINANCE_QUERIES, awaitRefetchQueries: true })

  const categories = data?.categories ?? []
  const totalTransactions = categories.reduce((sum, category) => sum + category.transactionCount, 0)
  const mostUsed = categories.reduce<Category | null>(
    (best, category) => (category.transactionCount > (best?.transactionCount ?? 0) ? category : best),
    null,
  )

  function openCreate() {
    setEditing(null)
    setIsFormOpen(true)
  }

  function openEdit(category: Category) {
    setEditing(category)
    setIsFormOpen(true)
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteCategory({ variables: { id: deleting.id } })
      toast.success('Categoria excluída')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <>
      <PageHeader
        title="Categorias"
        description="Organize suas transações por categorias"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus /> Nova categoria
          </Button>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard icon={<TagIcon className="text-gray-700" />} value={categories.length} label="Total de categorias" />
        <StatCard
          icon={<ArrowUpDown className="text-purple-base" />}
          value={totalTransactions}
          label="Total de transações"
        />
        <StatCard
          icon={<CategoryGlyph category={mostUsed} />}
          value={mostUsed?.title ?? '—'}
          label="Categoria mais utilizada"
        />
      </div>

      {categories.length === 0 ? (
        <Card className="px-6 py-10 text-center text-sm text-gray-500">
          {loading ? 'Carregando...' : 'Nenhuma categoria cadastrada. Crie a primeira!'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Card key={category.id} className="flex flex-col gap-5 p-6">
              <div className="flex items-start justify-between">
                <CategoryIcon icon={category.icon} color={category.color} />
                <div className="flex gap-2">
                  <IconButton variant="danger" aria-label="Excluir categoria" onClick={() => setDeleting(category)}>
                    <Trash />
                  </IconButton>
                  <IconButton aria-label="Editar categoria" onClick={() => openEdit(category)}>
                    <SquarePen />
                  </IconButton>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="font-semibold text-gray-800">{category.title}</h3>
                <p className={cn('text-sm text-gray-600', !category.description && 'italic text-gray-400')}>
                  {category.description || 'Sem descrição'}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Tag color={category.color}>{category.title}</Tag>
                <span className="text-sm text-gray-600">
                  {category.transactionCount} {category.transactionCount === 1 ? 'item' : 'itens'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CategoryDialog open={isFormOpen} onOpenChange={setIsFormOpen} category={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir categoria"
        description={
          deleting?.transactionCount
            ? `As ${deleting.transactionCount} transações de "${deleting.title}" ficarão sem categoria. Deseja continuar?`
            : `Tem certeza que deseja excluir "${deleting?.title ?? ''}"?`
        }
        onConfirm={handleDelete}
      />
    </>
  )
}
