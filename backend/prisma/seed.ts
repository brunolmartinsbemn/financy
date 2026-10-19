import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEMO_EMAIL = 'conta@teste.com'

const categories = [
  { title: 'Alimentação', description: 'Restaurantes, delivery e refeições', icon: 'utensils', color: 'blue' },
  { title: 'Entretenimento', description: 'Cinema, jogos e lazer', icon: 'ticket', color: 'pink' },
  { title: 'Investimento', description: 'Aplicações e retornos financeiros', icon: 'piggy-bank', color: 'green' },
  { title: 'Mercado', description: 'Compras de supermercado e mantimentos', icon: 'shopping-cart', color: 'orange' },
  { title: 'Salário', description: 'Renda mensal e bonificações', icon: 'briefcase-business', color: 'green' },
  { title: 'Saúde', description: 'Medicamentos, consultas e exames', icon: 'heart-pulse', color: 'red' },
  { title: 'Transporte', description: 'Gasolina, transporte público e viagens', icon: 'car-front', color: 'purple' },
  { title: 'Utilidades', description: 'Energia, água, internet e telefone', icon: 'tool-case', color: 'yellow' },
]

function monthDate(monthsAgo: number, day: number) {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, day))
}

async function main() {
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } })

  const user = await prisma.user.create({
    data: { name: 'Conta teste', email: DEMO_EMAIL, passwordHash: await bcrypt.hash('12345678', 10) },
  })

  const byTitle: Record<string, string> = {}
  for (const category of categories) {
    const created = await prisma.category.create({ data: { ...category, userId: user.id } })
    byTitle[category.title] = created.id
  }

  const transactions: Array<[string, number, 'INCOME' | 'EXPENSE', Date, string]> = [
    ['Pagamento de Salário', 425000, 'INCOME', monthDate(0, 1), 'Salário'],
    ['Jantar no Restaurante', 8950, 'EXPENSE', monthDate(0, 3), 'Alimentação'],
    ['Posto de Gasolina', 10000, 'EXPENSE', monthDate(0, 4), 'Transporte'],
    ['Compras no Mercado', 15680, 'EXPENSE', monthDate(0, 5), 'Mercado'],
    ['Retorno de Investimento', 34025, 'INCOME', monthDate(0, 6), 'Investimento'],
    ['Aluguel', 170000, 'EXPENSE', monthDate(0, 7), 'Utilidades'],
    ['Cinema', 8800, 'EXPENSE', monthDate(0, 8), 'Entretenimento'],
    ['Freelance', 250000, 'INCOME', monthDate(1, 24), 'Salário'],
    ['Compras Jantar', 15000, 'EXPENSE', monthDate(1, 22), 'Mercado'],
    ['Farmácia', 6490, 'EXPENSE', monthDate(1, 15), 'Saúde'],
    ['Pagamento de Salário', 425000, 'INCOME', monthDate(1, 1), 'Salário'],
    ['Internet', 9990, 'EXPENSE', monthDate(1, 10), 'Utilidades'],
  ]

  for (const [description, amount, type, date, category] of transactions) {
    await prisma.transaction.create({
      data: { description, amount, type, date, categoryId: byTitle[category], userId: user.id },
    })
  }

  console.log(`Seed concluído: ${DEMO_EMAIL} / 12345678`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
