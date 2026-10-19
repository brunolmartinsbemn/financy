import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { inputBoxClass } from './input'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ invalid, className, children, ...props }, ref) => (
  <div className={cn(inputBoxClass, 'relative', invalid && 'border-danger focus-within:border-danger', className)}>
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className="h-full w-full appearance-none bg-transparent pr-6 outline-none invalid:text-gray-400"
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 !text-gray-700" />
  </div>
))
Select.displayName = 'Select'
