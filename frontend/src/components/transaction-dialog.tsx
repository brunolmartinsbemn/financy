import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@apollo/client'
import { CircleArrowDown, CircleArrowUp } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog } from './ui/dialog'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { CATEGORIES, CREATE_TRANSACTION, FINANCE_QUERIES, UPDATE_TRANSACTION } from '@/graphql/operations'
import type { Category, Transaction, TransactionType } from '@/graphql/types'
import { centsToInput, todayISO } from '@/lib/format'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().trim().min(1, 'Informe a descrição'),
  date: z.string().min(1, 'Informe a data'),
  amount: z.number({ invalid_type_error: 'Informe o valor' }).int().positive('Informe o valor'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
})

type FormValues = z.infer<typeof schema>

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
}

function defaultValues(transaction?: Transaction | null): FormValues {
  return {
    type: transaction?.type ?? 'EXPENSE',
    description: transaction?.description ?? '',
    date: transaction?.date ?? todayISO(),
    amount: transaction?.amount ?? 0,
    categoryId: transaction?.category?.id ?? '',
  }
}

const typeOptions: Array<{ value: TransactionType; label: string; icon: typeof CircleArrowUp; active: string }> = [
  { value: 'EXPENSE', label: 'Despesa', icon: CircleArrowDown, active: 'border-danger text-gray-800 [&_svg]:text-danger' },
  { value: 'INCOME', label: 'Receita', icon: CircleArrowUp, active: 'border-success text-gray-800 [&_svg]:text-success' },
]

export function TransactionDialog({ open, onOpenChange, transaction }: TransactionDialogProps) {
  const isEditing = !!transaction
  const { data } = useQuery<{ categories: Category[] }>(CATEGORIES, { skip: !open })
  const mutationOptions = { refetchQueries: FINANCE_QUERIES, awaitRefetchQueries: true }
  const [createTransaction] = useMutation(CREATE_TRANSACTION, mutationOptions)
  const [updateTransaction] = useMutation(UPDATE_TRANSACTION, mutationOptions)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaultValues(transaction) })

  useEffect(() => {
    if (open) reset(defaultValues(transaction))
  }, [open, transaction, reset])

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing) {
        await updateTransaction({ variables: { id: transaction.id, data: values } })
        toast.success('Transação atualizada')
      } else {
        await createTransaction({ variables: { data: values } })
        toast.success('Transação criada')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar transação' : 'Nova transação'}
      description="Registre sua despesa ou receita"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <div role="radiogroup" aria-label="Tipo" className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 p-2">
              {typeOptions.map(({ value, label, icon: Icon, active }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={field.value === value}
                  onClick={() => field.onChange(value)}
                  className={cn(
                    'flex h-12 items-center justify-center gap-2 rounded-lg border text-base transition-colors [&_svg]:size-4',
                    field.value === value ? cn('bg-white font-medium', active) : 'border-transparent text-gray-600 hover:bg-gray-100',
                  )}
                >
                  <Icon /> {label}
                </button>
              ))}
            </div>
          )}
        />

        <Field label="Descrição" htmlFor="tx-description" error={errors.description?.message}>
          <Input
            id="tx-description"
            placeholder="Ex. Almoço no restaurante"
            invalid={!!errors.description}
            {...register('description')}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Data" htmlFor="tx-date" error={errors.date?.message}>
            <Input id="tx-date" type="date" invalid={!!errors.date} {...register('date')} />
          </Field>

          <Field label="Valor" htmlFor="tx-amount" error={errors.amount?.message}>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <Input
                  id="tx-amount"
                  inputMode="numeric"
                  prefix="R$"
                  placeholder="0,00"
                  invalid={!!errors.amount}
                  value={field.value ? centsToInput(field.value) : ''}
                  onChange={(event) => field.onChange(Number(event.target.value.replace(/\D/g, '').slice(0, 12)))}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
          </Field>
        </div>

        <Field label="Categoria" htmlFor="tx-category" error={errors.categoryId?.message}>
          <Select id="tx-category" required invalid={!!errors.categoryId} {...register('categoryId')}>
            <option value="" disabled>
              Selecione
            </option>
            {data?.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </Select>
        </Field>

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          Salvar
        </Button>
      </form>
    </Dialog>
  )
}
