'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { regionPath } from '@/lib/utils'
import type { TrendEntry } from '@/lib/types'

type Period = 3 | 6 | 12

interface Props {
  data: Record<Period, { gainers: TrendEntry[]; losers: TrendEntry[] }>
  latestYm: string
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 3, label: '3개월' },
  { value: 6, label: '6개월' },
  { value: 12, label: '12개월' },
]

function formatYM(ym: string) {
  return `${ym.slice(0, 4)}.${parseInt(ym.slice(4))}`
}

function TrendList({
  entries,
  type,
}: {
  entries: TrendEntry[]
  type: 'gainers' | 'losers'
}) {
  const isGainer = type === 'gainers'
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span style={{ fontSize: 16 }}>{isGainer ? '📈' : '📉'}</span>
        <p className="text-[14px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {isGainer ? '급증 TOP 10' : '급감 TOP 10'}
        </p>
      </div>
      {entries.map((e, i) => (
        <Link
          key={e.region.code}
          href={regionPath(e.region.sido, e.region.sigungu)}
          className="flex items-center justify-between transition-colors hover:bg-[var(--color-surface)]"
          style={{
            padding: '12px 16px',
            borderBottom: i < entries.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-[13px] font-bold tabular-nums"
              style={{ color: 'var(--color-text-secondary)', minWidth: 20 }}
            >
              {i + 1}
            </span>
            <div>
              <p className="text-[14px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {e.region.sigungu}
              </p>
              <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                {e.region.sido}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p
                className="text-[14px] font-bold tabular-nums"
                style={{ color: isGainer ? 'var(--color-positive)' : 'var(--color-negative)' }}
              >
                {e.change >= 0 ? '+' : ''}{e.change.toLocaleString('ko-KR')}명
              </p>
              <p
                className="text-[11px] font-semibold"
                style={{ color: isGainer ? 'var(--color-positive)' : 'var(--color-negative)' }}
              >
                {e.changeRate >= 0 ? '+' : ''}{e.changeRate.toFixed(2)}%
              </p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
          </div>
        </Link>
      ))}
    </div>
  )
}

export function TrendingClient({ data, latestYm }: Props) {
  const [period, setPeriod] = useState<Period>(12)
  const { gainers, losers } = data[period]

  return (
    <div>
      {/* 기간 토글 */}
      <div
        className="flex gap-1 rounded-lg"
        style={{ backgroundColor: 'var(--color-surface)', padding: 4, display: 'inline-flex', marginBottom: 20 }}
      >
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className="rounded-md text-[13px] font-semibold transition-all"
            style={{
              padding: '6px 14px',
              backgroundColor: period === opt.value ? 'var(--color-bg)' : 'transparent',
              color: period === opt.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: period === opt.value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
        기준: {formatYM(latestYm)} · {period}개월 전 대비
      </p>

      <div className="space-y-4">
        <TrendList entries={gainers} type="gainers" />
        <TrendList entries={losers} type="losers" />
      </div>
    </div>
  )
}
