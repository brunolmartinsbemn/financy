import { CircleArrowDown, CircleArrowUp } from 'lucide-react'
import type { TransactionType } from '@/graphql/types'

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  return type === 'INCOME' ? (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-green-dark">
      <CircleArrowUp className="size-4" /> Entrada
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-red-dark">
      <CircleArrowDown className="size-4" /> Saída
    </span>
  )
}
