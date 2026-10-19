import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@apollo/client'
import { LogOut, Mail, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth'
import { UPDATE_PROFILE } from '@/graphql/operations'
import { getErrorMessage } from '@/lib/errors'
import { initials } from '@/lib/format'

const schema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome completo'),
})

type FormValues = z.infer<typeof schema>

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const [updateProfile] = useMutation(UPDATE_PROFILE)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: { name: user?.name ?? '' } })

  async function onSubmit(values: FormValues) {
    try {
      await updateProfile({ variables: { data: values } })
      reset(values)
      toast.success('Perfil atualizado')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  if (!user) return null

  return (
    <Card className="mx-auto w-full max-w-[448px] p-8">
      <div className="flex flex-col items-center gap-1 border-b border-gray-200 pb-8 text-center">
        <span className="mb-5 inline-flex size-16 items-center justify-center rounded-full bg-gray-300 text-2xl font-medium text-gray-800">
          {initials(user.name)}
        </span>
        <h1 className="text-xl font-semibold text-gray-800">{user.name}</h1>
        <p className="text-base text-gray-500">{user.email}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-8" noValidate>
        <Field label="Nome completo" htmlFor="profile-name" error={errors.name?.message}>
          <Input id="profile-name" icon={<UserRound />} invalid={!!errors.name} {...register('name')} />
        </Field>

        <Field label="E-mail" htmlFor="profile-email" hint="O e-mail não pode ser alterado">
          <Input id="profile-email" icon={<Mail />} value={user.email} disabled readOnly />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          Salvar alterações
        </Button>
        <Button variant="outline" className="w-full" onClick={signOut}>
          <LogOut className="text-danger" /> Sair da conta
        </Button>
      </form>
    </Card>
  )
}
