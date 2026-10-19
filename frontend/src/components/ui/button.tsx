import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline'
type Size = 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-base text-white hover:bg-brand-dark disabled:bg-brand-base/50',
  outline:
    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-200 disabled:border-gray-200 disabled:bg-white disabled:text-gray-400',
}

const sizes: Record<Size, string> = {
  md: 'h-12 gap-2 px-4 text-base [&_svg]:size-[18px]',
  sm: 'h-9 gap-1.5 px-3 text-sm [&_svg]:size-4',
}

export function buttonClass({ variant = 'primary', size = 'md' }: { variant?: Variant; size?: Size } = {}) {
  return cn(
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed [&_svg]:shrink-0',
    variants[variant],
    sizes[size],
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClass({ variant, size }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
