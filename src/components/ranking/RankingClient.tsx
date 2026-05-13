'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { regionPath } from '@/lib/utils'
import type { RegionRankEntry } from '@/lib/types'

type SortKey = 'population' | 'popChange' | 'popChangeRate' | 'households'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'population', label: '총 인구' },
  { value: 'popChange', label: '전월 증감' },
  { value: 'popChangeRate', label: '전년 증감률' },
  { value: 'households', label: '세대수' },
]

interface Props {
  entries: RegionRankEntry[]
  sidos: string[]
  ym: string
}

function formatYM(ym: string) {
  return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4))}월`
}

export function RankingClient({ entries, sidos, ym }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('population')
  const [sidoFilter, setSidoFilter] = useState('전체')

  const sorted = useMemo(() => {
    const filtered = sidoFilter === '전체' ? entries : entries.filter(e => e.region.sido === sidoFilter)
    return [...filtered].sort((a, b) => {
      if (sortKey === 'popChangeRate') return b.popChangeRate - a.popChangeRate
      return b[sortKey] - a[sortKey]
    })
  }, [entries, sortKey, sidoFilter])

  function formatValue(e: RegionRankEntry): string {
    if (sortKey === 'population') return e.population.toLocaleString('ko-KR') + '명'
    if (sortKey === 'households') return e.households.toLocaleString('ko-KR') + '세대'
    if (sortKey === 'popChangeRate') return (e.popChangeRate >= 0 ? '+' : '') + e.popChangeRate.toFixed(2) + '%'
    const v = e.popChange
    return (v >= 0 ? '+' : '') + v.toLocaleString('ko-KR') + '명'
  }

  function getValueColor(e: RegionRankEntry): string {
    const v = sortKey === 'population' || sortKey === 'households' ? 1 :
      sortKey === 'popChange' ? e.popChange : e.popChangeRate
    if (v > 0) return 'var(--color-positive)'
    if (v < 0) return 'var(--color-negative)'
    return 'var(--color-text-primary)'
  }

  return (
    <div>
      {/* 정렬 + 필터 */}
      <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="flex-1 rounded-lg text-[13px] font-semibold bg-transparent appearance-none cursor-pointer"
          style={{
            border: '1px solid var(--color-border)',
            padding: '8px 12px',
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={sidoFilter}
          onChange={e => setSidoFilter(e.target.value)}
          className="rounded-lg text-[13px] font-semibold bg-transparent appearance-none cursor-pointer"
          style={{
            border: '1px solid var(--color-border)',
            padding: '8px 12px',
            color: 'var(--color-accent)',
            backgroundColor: 'var(--color-bg)',
            minWidth: 90,
          }}
        >
          <option value="전체">전체</option>
          {sidos.map(s => <option key={s} value={s}>{s.replace('특별시', '').replace('광역시', '').replace('특별자치시', '').replace('특별자치도', '').replace('도', '')}</option>)}
        </select>
      </div>

      <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        {formatYM(ym)} 기준 · {sorted.length}개 지역
      </p>

      {/* 순위 목록 */}
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
      >
        {sorted.map((e, i) => (
          <Link
            key={e.region.code}
            href={regionPath(e.region.sido, e.region.sigungu)}
            className="flex items-center justify-between transition-colors hover:bg-[var(--color-surface)]"
            style={{
              padding: '14px 16px',
              borderBottom: i < sorted.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-[13px] font-bold tabular-nums"
                style={{
                  color: i < 3 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  minWidth: 24,
                }}
              >
                {i + 1}
              </span>
              <div>
                <p className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {e.region.sigungu}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {e.region.sido}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p
                className="text-[14px] font-bold tabular-nums"
                style={{ color: getValueColor(e) }}
              >
                {formatValue(e)}
              </p>
              <ChevronRight size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function RankingHeader({ ym }: { ym: string }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          지역 순위
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>
          {formatYM(ym)} 기준
        </p>
      </div>
      <Link
        href="/trending"
        className="flex items-center gap-1.5 rounded-full text-[13px] font-semibold"
        style={{
          backgroundColor: 'var(--color-accent-light)',
          color: 'var(--color-accent)',
          padding: '7px 14px',
        }}
      >
        <TrendingUp size={14} />
        트렌딩
      </Link>
    </div>
  )
}
