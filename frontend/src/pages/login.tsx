import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Lock, Mail, UserRoundPlus } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout, Divider } from '@/components/auth-layout'
import { Button, buttonClass } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth'
import { LOGIN } from '@/graphql/operations'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

const REMEMBERED_EMAIL_KEY = '@financy:email'

const schema = z.object({
  email: z.string().trim().email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe sua senha'),
  remember: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { signIn } = useAuth()
  const [login] = useMutation<{ login: { token: string } }>(LOGIN)

  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: rememberedEmail ?? '', password: '', remember: !!rememberedEmail },
  })

  async function onSubmit({ email, password, remember }: FormValues) {
    try {
      const { data } = await login({ variables: { data: { email, password } } })
      if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
      else localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      await signIn(data!.login.token)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <AuthLayout title="Fazer login" description="Entre na sua conta para continuar">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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

        <Field label="Senha" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            icon={<Lock />}
            invalid={!!errors.password}
            {...register('password')}
          />
        </Field>

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-gray-700">
            <input type="checkbox" className="size-4 rounded accent-brand-base" {...register('remember')} />
            Lembrar-me
          </label>
          <button
            type="button"
            className="font-medium text-brand-base hover:underline"
            onClick={() => toast.info('Recuperação de senha ainda não está disponível')}
          >
            Recuperar senha
          </button>
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          Entrar
        </Button>
      </form>

      <Divider />

      <p className="mb-4 text-center text-sm text-gray-600">Ainda não tem uma conta?</p>
      <Link to="/cadastro" className={cn(buttonClass({ variant: 'outline' }), 'w-full')}>
        <UserRoundPlus /> Criar conta
      </Link>
    </AuthLayout>
  )
}
