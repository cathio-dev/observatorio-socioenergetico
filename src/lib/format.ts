import type { Observation } from './data'

const number = (digits: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: 0 })

/** Formata um valor respeitando a unidade publicada pela fonte. `null` indica ausência de dado (nunca zero). */
export function formatMeasure(value: number | null | undefined, unit = '', withUnit = false): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  if (unit === '%') return `${number(1).format(value)}%`
  if (unit.startsWith('R$')) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
  if (unit.startsWith('índice')) return number(3).format(value)
  if (unit === 'pessoas por domicílio') return number(1).format(value) + (withUnit ? ' pessoas/domicílio' : '')
  const text = number(0).format(value)
  return withUnit && unit ? `${text} ${unit}` : text
}

export const isShare = (unit?: string) => unit === '%'

/** Diferença entre dois valores: pontos percentuais para proporções, valor absoluto nas demais unidades. */
export function formatDifference(a: number | null, b: number | null, unit = ''): string {
  if (a === null || b === null) return '—'
  const diff = Math.abs(a - b)
  if (isShare(unit)) return `${number(1).format(diff)} p.p.`
  return formatMeasure(diff, unit)
}

/** Diferença relativa ao menor valor. Não se aplica a proporções (usa-se p.p.) nem quando o menor valor é zero. */
export function relativeDifference(a: number | null, b: number | null, unit = ''): string {
  if (a === null || b === null || isShare(unit)) return '—'
  const min = Math.min(a, b)
  if (min <= 0) return '—'
  return `${number(1).format((Math.max(a, b) / min - 1) * 100)}%`
}

/** Busca o valor de um bairro pelo código do território, sem depender da ordem das linhas. */
export function valueFor(rows: Observation[], code: string): number | null {
  return rows.find((row) => row.territory_code === code)?.value ?? null
}
