import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { Dialog } from './ui/dialog'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { CATEGORY_COLORS, CATEGORY_ICONS } from './category-icon'
import { CREATE_CATEGORY, FINANCE_QUERIES, UPDATE_CATEGORY } from '@/graphql/operations'
import type { Category } from '@/graphql/types'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().trim().min(1, 'Informe o título'),
  description: z.string().trim(),
  icon: z.string().min(1, 'Selecione um ícone'),
  color: z.enum(['green', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow']),
})

type FormValues = z.infer<typeof schema>

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
}

function defaultValues(category?: Category | null): FormValues {
  return {
    title: category?.title ?? '',
    description: category?.description ?? '',
    icon: category?.icon ?? Object.keys(CATEGORY_ICONS)[0],
    color: category?.color ?? 'green',
  }
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const isEditing = !!category
  const mutationOptions = { refetchQueries: FINANCE_QUERIES, awaitRefetchQueries: true }
  const [createCategory] = useMutation(CREATE_CATEGORY, mutationOptions)
  const [updateCategory] = useMutation(UPDATE_CATEGORY, mutationOptions)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaultValues(category) })

  useEffect(() => {
    if (open) reset(defaultValues(category))
  }, [open, category, reset])

  async function onSubmit(values: FormValues) {
    const data = { ...values, description: values.description || null }

    try {
      if (isEditing) {
        await updateCategory({ variables: { id: category.id, data } })
        toast.success('Categoria atualizada')
      } else {
        await createCategory({ variables: { data } })
        toast.success('Categoria criada')
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
      title={isEditing ? 'Editar categoria' : 'Nova categoria'}
      description="Organize suas transações com categorias"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Título" htmlFor="cat-title" error={errors.title?.message}>
          <Input id="cat-title" placeholder="Ex. Alimentação" invalid={!!errors.title} {...register('title')} />
        </Field>

        <Field label="Descrição" htmlFor="cat-description" hint="Opcional">
          <Input id="cat-description" placeholder="Descrição da categoria" {...register('description')} />
        </Field>

        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-gray-700">Ícone</legend>
              <div className="grid grid-cols-8 gap-2">
                {Object.entries(CATEGORY_ICONS).map(([name, Icon]) => (
                  <button
                    key={name}
                    type="button"
                    aria-label={name}
                    aria-pressed={field.value === name}
                    onClick={() => field.onChange(name)}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-lg border text-gray-500 transition-colors hover:bg-gray-100 [&_svg]:size-5',
                      field.value === name ? 'border-brand-base bg-gray-100 text-gray-800' : 'border-gray-300',
                    )}
                  >
                    <Icon />
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        />

        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-gray-700">Cor</legend>
              <div className="grid grid-cols-7 gap-2">
                {CATEGORY_COLORS.map(({ value, swatch }) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={value}
                    aria-pressed={field.value === value}
                    onClick={() => field.onChange(value)}
                    className={cn(
                      'flex h-8 items-center justify-center rounded-lg border p-1 transition-colors',
                      field.value === value ? 'border-brand-base' : 'border-gray-300 hover:bg-gray-100',
                    )}
                  >
                    <span className={cn('size-full rounded', swatch)} />
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          Salvar
        </Button>
      </form>
    </Dialog>
  )
}
