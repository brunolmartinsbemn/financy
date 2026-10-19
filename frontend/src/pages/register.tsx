import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Lock, LogIn, Mail, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout, Divider } from '@/components/auth-layout'
import { Button, buttonClass } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth'
import { REGISTER } from '@/graphql/operations'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome completo'),
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [registerUser] = useMutation<{ register: { token: string } }>(REGISTER)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      const { data } = await registerUser({ variables: { data: values } })
      await signIn(data!.register.token)
      toast.success('Conta criada com sucesso!')
      navigate('/')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AuthLayout title="Criar conta" description="Comece a controlar suas finanças ainda hoje">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Nome completo" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Seu nome completo"
            icon={<UserRound />}
            invalid={!!errors.name}
            {...register('name')}
          />
        </Field>

        <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="mail@exemplo.com"
            icon={<Mail />}
            invalid={!!errors.email}
            {...register('email')}
          />
        </Field>

        <Field
          label="Senha"
          htmlFor="password"
          error={errors.password?.message}
          hint="A senha deve ter no mínimo 8 caracteres"
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Digite sua senha"
            icon={<Lock />}
            invalid={!!errors.password}
            {...register('password')}
          />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          Cadastrar
        </Button>
      </form>

      <Divider />

      <p className="mb-4 text-center text-sm text-gray-600">Já tem uma conta?</p>
      <Link to="/" className={cn(buttonClass({ variant: 'outline' }), 'w-full')}>
        <LogIn /> Fazer login
      </Link>
    </AuthLayout>
  )
}
