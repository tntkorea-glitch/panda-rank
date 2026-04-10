import crypto from 'crypto'

export function generateId(): string {
  return `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
}

export function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR')
}
