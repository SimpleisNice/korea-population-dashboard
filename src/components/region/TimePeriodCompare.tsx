'use client'

import { useState, useEffect, useCallback, startTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { GitCompare, X } from 'lucide-react'
import { fetchMonthStats } from '@/lib/actions'
import { formatNumber, formatYM } from '@/lib/utils'
import type { MonthlyStats } from '@/lib/types'

interface Props {
  regionCode: string
  currentMonth: string
  availableMonths: string[]
  currentStats: MonthlyStats
}

function DiffBadge({ a, b }: { a: number; b: number }) {
  const diff = a - b
  if (diff === 0) {
    return <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral)' }}>–</span>
  }
  const pct = b !== 0 ? ((diff / b) * 100).toFixed(1) : null
  const color = diff > 0 ? 'var(--color-positive)' : 'var(--color-negative)'
  return (
    <span style={{ fontSize: 11, color, fontWeight: 600 }}>
      {diff > 0 ? '▲' : '▼'} {Math.abs(diff).toLocaleString('ko-KR')}{pct != null ? ` (${pct}%)` : ''}
    </span>
  )
}

function Row({ label, cur, cmp }: { label: string; cur: number; cmp: number }) {
  return (
    <div
      className="grid grid-cols-3 items-center gap-2 py-3 border-b last:border-b-0 text-sm"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="text-right">
        <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {formatNumber(cur)}
        </p>
        <DiffBadge a={cur} b={cmp} />
      </div>
      <p className="text-center text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </p>
      <p className="text-left font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
        {formatNumber(cmp)}
      </p>
    </div>
  )
}

export function TimePeriodCompare({ regionCode, currentMonth, availableMonths, currentStats }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const cmp = searchParams.get('cmp') ?? ''
  const [cmpStats, setCmpStats] = useState<MonthlyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    const valid = cmp && availableMonths.includes(cmp) && cmp !== currentMonth
    if (!valid) {
      startTransition(() => { setCmpStats(null); setFetchError(false) })
      return
    }
    startTransition(() => { setLoading(true); setFetchError(false) })
    fetchMonthStats(regionCode, cmp)
      .then(s => {
        startTransition(() => { setCmpStats(s); setLoading(false) })
      })
      .catch(() => {
        startTransition(() => { setFetchError(true); setLoading(false) })
      })
  }, [cmp, regionCode, availableMonths, currentMonth])

  const setCmp = useCallback(
    (ym: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (ym) params.set('cmp', ym)
      else params.delete('cmp')
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  if (!cmp) {
    return (
      <button
        onClick={() => {
          const idx = availableMonths.indexOf(currentMonth)
          const defaultCmp = availableMonths[idx - 1] ?? availableMonths.find(m => m !== currentMonth) ?? ''
          setCmp(defaultCmp)
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold"
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-secondary)',
          padding: '14px 20px',
          marginBottom: 20,
          border: '1px dashed var(--color-border)',
        }}
      >
        <GitCompare size={15} />
        시점 비교 추가
      </button>
    )
  }

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: 'var(--color-bg)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 20,
      }}
    >
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          시점 비교
        </p>
        <button
          onClick={() => setCmp('')}
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)' }}
          aria-label="비교 닫기"
        >
          <X size={13} />
        </button>
      </div>

      {/* 컬럼 헤더 */}
      <div
        className="grid grid-cols-3 px-4 py-2 text-[11px] font-semibold"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <p className="text-right" style={{ color: 'var(--color-accent)' }}>{formatYM(currentMonth)}</p>
        <span />
        <div className="flex items-center gap-1">
          <select
            value={cmp}
            onChange={e => setCmp(e.target.value)}
            className="bg-transparent text-[11px] font-semibold appearance-none cursor-pointer"
            style={{ color: '#7c3aed' }}
          >
            {availableMonths
              .filter(m => m !== currentMonth)
              .map(m => (
                <option key={m} value={m}>
                  {formatYM(m)}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* 비교 지표 */}
      <div className="px-4">
        {loading ? (
          <p className="py-6 text-center text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
            불러오는 중…
          </p>
        ) : fetchError ? (
          <p className="py-6 text-center text-[13px]" style={{ color: 'var(--color-negative)' }}>
            데이터를 불러오지 못했습니다
          </p>
        ) : !cmpStats ? (
          <p className="py-6 text-center text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
            데이터 없음
          </p>
        ) : (
          <>
            <Row label="총 인구" cur={currentStats.population} cmp={cmpStats.population} />
            <Row label="세대수" cur={currentStats.households} cmp={cmpStats.households} />
            <Row label="세대당 인구" cur={currentStats.householdSize} cmp={cmpStats.householdSize} />
            <Row label="남자" cur={currentStats.male} cmp={cmpStats.male} />
            <Row label="여자" cur={currentStats.female} cmp={cmpStats.female} />
          </>
        )}
      </div>
    </div>
  )
}
