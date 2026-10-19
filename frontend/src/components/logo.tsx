import { cn } from '@/lib/utils'

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn('size-6', className)}>
      <circle cx="11" cy="12" r="7.5" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="21" cy="20" r="7.5" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="11" cy="12" r="2" fill="currentColor" />
      <circle cx="21" cy="20" r="2" fill="currentColor" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-brand-base', className)} aria-label="Financy">
      <LogoIcon />
      <span className="text-xl font-extrabold tracking-wide italic">FINANCY</span>
    </span>
  )
}
