'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback } from 'react'

interface Props {
  availableMonths: string[] // sorted YYYYMM strings
  current: string           // currently selected YYYYMM
  paramKey?: string         // URL param name, defaults to 'ym'
}

function formatLabel(ym: string) {
  return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4))}월`
}

export function MonthPicker({ availableMonths, current, paramKey = 'ym' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navigate = useCallback(
    (ym: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(paramKey, ym)
      // reset cmp param when base month changes
      if (paramKey === 'ym') params.delete('cmp')
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams, paramKey],
  )

  const currentIdx = availableMonths.indexOf(current)
  const canPrev = currentIdx > 0
  const canNext = currentIdx < availableMonths.length - 1

  return (
    <div
      className="flex items-center justify-between rounded-xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        padding: '10px 16px',
      }}
    >
      <button
        onClick={() => canPrev && navigate(availableMonths[currentIdx - 1])}
        disabled={!canPrev}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
        style={{
          color: canPrev ? 'var(--color-accent)' : 'var(--color-border)',
          backgroundColor: canPrev ? 'var(--color-accent-light)' : 'transparent',
        }}
        aria-label="이전 달"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex-1 text-center">
        <select
          value={current}
          onChange={e => navigate(e.target.value)}
          className="cursor-pointer bg-transparent text-[14px] font-semibold text-center appearance-none"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="기준 월 선택"
        >
          {availableMonths.map(ym => (
            <option key={ym} value={ym}>
              {formatLabel(ym)}
            </option>
          ))}
        </select>
        <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>
          기준월
        </p>
      </div>

      <button
        onClick={() => canNext && navigate(availableMonths[currentIdx + 1])}
        disabled={!canNext}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
        style={{
          color: canNext ? 'var(--color-accent)' : 'var(--color-border)',
          backgroundColor: canNext ? 'var(--color-accent-light)' : 'transparent',
        }}
        aria-label="다음 달"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
