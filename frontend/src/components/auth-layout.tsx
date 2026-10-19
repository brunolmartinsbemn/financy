import type { ReactNode } from 'react'
import { Card } from './ui/card'
import { Logo } from './logo'

export function AuthLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12">
      <Logo className="mb-8 [&>span:last-child]:text-2xl [&_svg]:size-8" />
      <Card className="w-full max-w-[448px] p-8">
        <div className="mb-8 flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <p className="text-base text-gray-600">{description}</p>
        </div>
        {children}
      </Card>
    </div>
  )
}

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-sm text-gray-500">
      <span className="h-px flex-1 bg-gray-300" />
      ou
      <span className="h-px flex-1 bg-gray-300" />
    </div>
  )
}
