import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'danger'
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'default', className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4',
        variant === 'danger' ? 'text-danger' : 'text-gray-700',
        className,
      )}
      {...props}
    />
  ),
)
IconButton.displayName = 'IconButton'
