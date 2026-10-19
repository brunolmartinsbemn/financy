import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { CategoryColor } from '@/graphql/types'

export type TagColor = CategoryColor | 'gray'

const colors: Record<TagColor, string> = {
  gray: 'bg-gray-200 text-gray-700',
  blue: 'bg-blue-light text-blue-dark',
  purple: 'bg-purple-light text-purple-dark',
  pink: 'bg-pink-light text-pink-dark',
  red: 'bg-red-light text-red-dark',
  orange: 'bg-orange-light text-orange-dark',
  yellow: 'bg-yellow-light text-yellow-dark',
  green: 'bg-green-light text-green-dark',
}

export function Tag({ color = 'gray', children }: { color?: TagColor; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-sm font-medium', colors[color])}>
      {children}
    </span>
  )
}
