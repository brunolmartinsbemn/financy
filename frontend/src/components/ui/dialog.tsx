import type { ReactNode } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-gray-800/40" />
        <RadixDialog.Content
          className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-[448px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-lg focus:outline-none"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <RadixDialog.Title className="text-base font-semibold text-gray-800">{title}</RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="text-sm text-gray-600">{description}</RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close
              aria-label="Fechar"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-200 [&_svg]:size-4"
            >
              <X />
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
