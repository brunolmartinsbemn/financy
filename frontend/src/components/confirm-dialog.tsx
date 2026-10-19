import { useState } from 'react'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => Promise<void>
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Excluir', onConfirm }: ConfirmDialogProps) {
  const [isPending, setIsPending] = useState(false)

  async function handleConfirm() {
    setIsPending(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button className="bg-danger hover:bg-red-dark disabled:bg-danger/50" disabled={isPending} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
