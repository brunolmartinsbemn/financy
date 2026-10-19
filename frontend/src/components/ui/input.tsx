import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeClosed } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  prefix?: string
  invalid?: boolean
}

export const inputBoxClass =
  'flex h-12 w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 text-base text-gray-800 transition-colors focus-within:border-brand-base has-[input:disabled]:bg-gray-100 has-[input:disabled]:text-gray-500 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-gray-400'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, prefix, invalid, className, type, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const isPassword = type === 'password'

    return (
      <div className={cn(inputBoxClass, invalid && 'border-danger focus-within:border-danger', className)}>
        {icon}
        {prefix && <span className="text-gray-800">{prefix}</span>}
        <input
          ref={ref}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={invalid || undefined}
          className="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-gray-400"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            className="text-gray-700 [&_svg]:size-4"
          >
            {visible ? <Eye /> : <EyeClosed />}
          </button>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'
