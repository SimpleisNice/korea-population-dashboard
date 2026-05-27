'use client'

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { regionPath } from '@/lib/utils'
import type { RegionRankEntry } from '@/lib/types'

type SortKey = 'population' | 'popChange' | 'popChangeRate' | 'households'
const VALID_SORTS: SortKey[] = ['population', 'popChange', 'popChangeRate', 'households']

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'population',    label: '총 인구' },
  { value: 'popChange',     label: '전월 증감' },
  { value: 'popChangeRate', label: '전년 증감률' },
  { value: 'households',    label: '세대수' },
]

const MEDALS = ['🥇', '🥈', '🥉']
const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

interface Props {
  entries: RegionRankEntry[]
  sidos: string[]
  ym: string
  initialSort?: string
  initialSido?: string
}

function formatYM(ym: string) {
  return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4))}월`
}

function shortenSido(s: string) {
  return s
    .replace('특별자치도', '').replace('특별자치시', '')
    .replace('특별시', '').replace('광역시', '').replace('도', '')
}

export function RankingClient({ entries, sidos, ym, initialSort, initialSido }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sortKey: SortKey = (initialSort && VALID_SORTS.includes(initialSort as SortKey))
    ? initialSort as SortKey
    : 'population'
  const sidoFilter = (initialSido && (initialSido === '전체' || sidos.includes(initialSido)))
    ? initialSido
    : '전체'

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '전체' || value === 'population') params.delete(key)
    else params.set(key, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const sorted = useMemo(() => {
    const filtered = sidoFilter === '전체' ? entries : entries.filter(e => e.region.sido === sidoFilter)
    return [...filtered].sort((a, b) => {
      if (sortKey === 'popChangeRate') return b.popChangeRate - a.popChangeRate
      return b[sortKey] - a[sortKey]
    })
  }, [entries, sortKey, sidoFilter])

  // 바 너비 계산용 최댓값
  const maxAbsValue = useMemo(() => {
    if (!sorted.length) return 1
    if (sortKey === 'population')    return sorted[0].population
    if (sortKey === 'households')    return sorted[0].households
    if (sortKey === 'popChange')     return Math.max(...sorted.map(e => Math.abs(e.popChange)), 1)
    return Math.max(...sorted.map(e => Math.abs(e.popChangeRate)), 1)
  }, [sorted, sortKey])

  function getValue(e: RegionRankEntry): number {
    if (sortKey === 'popChangeRate') return e.popChangeRate
    return e[sortKey]
  }

  function formatValue(e: RegionRankEntry): string {
    if (sortKey === 'population')    return e.population.toLocaleString('ko-KR') + '명'
    if (sortKey === 'households')    return e.households.toLocaleString('ko-KR') + '세대'
    if (sortKey === 'popChangeRate') return (e.popChangeRate >= 0 ? '+' : '') + e.popChangeRate.toFixed(2) + '%'
    const v = e.popChange
    return (v >= 0 ? '+' : '') + v.toLocaleString('ko-KR') + '명'
  }

  function getValueColor(e: RegionRankEntry): string {
    const v = getValue(e)
    if (sortKey === 'population' || sortKey === 'households') return 'var(--color-text-primary)'
    if (v > 0) return 'var(--color-positive)'
    if (v < 0) return 'var(--color-negative)'
    return 'var(--color-text-secondary)'
  }

  return (
    <div>
      {/* ── 정렬 탭 (pill chips) ── */}
      <div
        className="no-scrollbar"
        style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, paddingBottom: 2 }}
      >
        {SORT_OPTIONS.map(o => {
          const active = sortKey === o.value
          return (
            <motion.button
              key={o.value}
              whileTap={{ scale: 0.93 }}
              onClick={() => setParam('sort', o.value)}
              style={{
                flexShrink: 0,
                padding: '7px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: active ? 'none' : '1px solid var(--color-border)',
                backgroundColor: active ? 'var(--color-accent)' : 'var(--color-bg)',
                color: active ? '#fff' : 'var(--color-text-secondary)',
                transition: 'background-color 0.18s, color 0.18s, border 0.18s',
              }}
            >
              {o.label}
            </motion.button>
          )
        })}
      </div>

      {/* ── 시도 필터 (pill chips) ── */}
      <div
        className="no-scrollbar"
        style={{ display: 'flex', gap: 5, overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }}
      >
        {['전체', ...sidos].map(s => {
          const active = sidoFilter === s
          const label = s === '전체' ? '전체' : shortenSido(s)
          return (
            <motion.button
              key={s}
              whileTap={{ scale: 0.93 }}
              onClick={() => setParam('sido', s)}
              style={{
                flexShrink: 0,
                padding: '5px 12px',
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: active ? '1px solid transparent' : '1px solid var(--color-border)',
                backgroundColor: active ? 'var(--color-accent-light)' : 'transparent',
                color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                transition: 'background-color 0.15s, color 0.15s',
              }}
            >
              {label}
            </motion.button>
          )
        })}
      </div>

      <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        {formatYM(ym)} 기준 · {sorted.length}개 지역
      </p>

      {/* ── 순위 목록 ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sortKey + '|' + sidoFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
        >
          {sorted.map((e, i) => {
            const value     = getValue(e)
            const absValue  = Math.abs(value)
            const barPct    = Math.min(100, (absValue / maxAbsValue) * 100)
            const isNeutral = sortKey === 'population' || sortKey === 'households'
            const barColor  = isNeutral
              ? 'var(--color-accent)'
              : value > 0 ? 'var(--color-accent)'
              : value < 0 ? 'var(--color-negative)'
              : 'var(--color-border)'

            return (
              <motion.div
                key={e.region.code}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: EASE, delay: Math.min(i * 0.028, 0.38) }}
              >
                <Link
                  href={regionPath(e.region.sido, e.region.sigungu)}
                  className="hover:bg-[var(--color-surface)]"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px 10px 14px',
                    borderBottom: i < sorted.length - 1 ? '1px solid var(--color-border)' : 'none',
                    textDecoration: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'background-color 0.15s',
                  }}
                >
                  {/* 하단 rate bar */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      bottom: 0,
                      height: 2,
                      width: `${barPct}%`,
                      backgroundColor: barColor,
                      opacity: 0.45,
                      borderRadius: '0 1px 0 0',
                    }}
                  />

                  {/* 왼쪽: 순위 + 지역명 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ minWidth: 28, textAlign: 'center' }}>
                      {i < 3 ? (
                        <span style={{ fontSize: 18, lineHeight: 1 }}>{MEDALS[i]}</span>
                      ) : (
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                        {e.region.sigungu}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                        {shortenSido(e.region.sido)}
                      </p>
                    </div>
                  </div>

                  {/* 오른쪽: 값 + 화살표 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: getValueColor(e),
                        textAlign: 'right',
                      }}
                    >
                      {formatValue(e)}
                    </p>
                    <ChevronRight size={15} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>
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
