const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

/** Formats an amount in cents as BRL currency. */
export function formatCurrency(cents: number) {
  return currency.format(cents / 100)
}

/** "2025-11-30" -> "30/11/25" */
export function formatShortDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year.slice(2)}`
}

/** "2025-11" -> "Novembro / 2025" */
export function formatPeriod(period: string) {
  const [year, month] = period.split('-').map(Number)
  return `${MONTHS[month - 1]} / ${year}`
}

export function currentPeriod() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/** Last `count` months as YYYY-MM, most recent first. */
export function recentPeriods(count = 12) {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })
}

export function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

/** 123456 cents -> "1.234,56" */
export function centsToInput(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
