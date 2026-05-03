import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
