import {
  BaggageClaim,
  BookOpen,
  BriefcaseBusiness,
  CarFront,
  Dumbbell,
  Gift,
  HeartPulse,
  House,
  Mailbox,
  PawPrint,
  PiggyBank,
  ReceiptText,
  ShoppingCart,
  Tag,
  Ticket,
  ToolCase,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CategoryColor } from '@/graphql/types'

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'briefcase-business': BriefcaseBusiness,
  'car-front': CarFront,
  'heart-pulse': HeartPulse,
  'piggy-bank': PiggyBank,
  'shopping-cart': ShoppingCart,
  ticket: Ticket,
  'tool-case': ToolCase,
  utensils: Utensils,
  'paw-print': PawPrint,
  house: House,
  gift: Gift,
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  'baggage-claim': BaggageClaim,
  mailbox: Mailbox,
  'receipt-text': ReceiptText,
}

export const CATEGORY_COLORS: Array<{ value: CategoryColor; swatch: string }> = [
  { value: 'green', swatch: 'bg-green-base' },
  { value: 'blue', swatch: 'bg-blue-base' },
  { value: 'purple', swatch: 'bg-purple-base' },
  { value: 'pink', swatch: 'bg-pink-base' },
  { value: 'red', swatch: 'bg-red-base' },
  { value: 'orange', swatch: 'bg-orange-base' },
  { value: 'yellow', swatch: 'bg-yellow-base' },
]

const boxColors: Record<CategoryColor | 'gray', string> = {
  gray: 'bg-gray-200 text-gray-500',
  green: 'bg-green-light text-green-base',
  blue: 'bg-blue-light text-blue-base',
  purple: 'bg-purple-light text-purple-base',
  pink: 'bg-pink-light text-pink-base',
  red: 'bg-red-light text-red-base',
  orange: 'bg-orange-light text-orange-base',
  yellow: 'bg-yellow-light text-yellow-base',
}

interface CategoryIconProps {
  icon?: string
  color?: CategoryColor
  className?: string
}

/** Colored square with the category icon (gray tag icon when there is no category). */
export function CategoryIcon({ icon, color, className }: CategoryIconProps) {
  const Icon = (icon && CATEGORY_ICONS[icon]) || Tag

  return (
    <span
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4',
        boxColors[color ?? 'gray'],
        className,
      )}
    >
      <Icon />
    </span>
  )
}
