import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { TrendPoint } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR')
}

export function formatChange(n: number): string {
  if (n === 0) return '0'
  return (n > 0 ? '+' : '') + n.toLocaleString('ko-KR')
}

export function encodeSlug(s: string): string {
  return encodeURIComponent(s)
}

export function decodeSlug(s: string): string {
  return decodeURIComponent(s)
}

export function regionPath(sido: string, sigungu: string): string {
  return `/${encodeSlug(sido)}/${encodeSlug(sigungu)}`
}

function nextYM(ym: string): string {
  const year = parseInt(ym.slice(0, 4))
  const month = parseInt(ym.slice(4))
  const next = month === 12 ? `${year + 1}01` : `${year}${String(month + 1).padStart(2, '0')}`
  return next
}

function ymToLabel(ym: string): string {
  return `${ym.slice(0, 4)}.${ym.slice(4)}`
}

export interface ForecastPoint {
  label: string
  forecast: number
}

export function buildForecast(trend: TrendPoint[], futurePeriods = 6): ForecastPoint[] {
  if (trend.length < 3) return []
  const n = trend.length
  const xs = trend.map((_, i) => i)
  const ys = trend.map(p => p.population)

  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0)
  const sumXX = xs.reduce((s, x) => s + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const lastLabel = trend[n - 1].label
  const lastYM = lastLabel.replace('.', '')

  const points: ForecastPoint[] = []
  let currentYM = lastYM
  for (let i = 1; i <= futurePeriods; i++) {
    currentYM = nextYM(currentYM)
    points.push({
      label: ymToLabel(currentYM),
      forecast: Math.round(intercept + slope * (n - 1 + i)),
    })
  }
  return points
}
