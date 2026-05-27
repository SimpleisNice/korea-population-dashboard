'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { regionPath } from '@/lib/utils'
import type { TrendEntry } from '@/lib/types'

type Period = 3 | 6 | 12

interface Props {
  data: Record<Period, { gainers: TrendEntry[]; losers: TrendEntry[] }>
  latestYm: string
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 3,  label: '3개월' },
  { value: 6,  label: '6개월' },
  { value: 12, label: '12개월' },
]

const MEDALS = ['🥇', '🥈', '🥉']
const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

function formatYM(ym: string) {
  return `${ym.slice(0, 4)}.${parseInt(ym.slice(4))}`
}

function shortenSido(s: string) {
  return s
    .replace('특별자치도', '').replace('특별자치시', '')
    .replace('특별시', '').replace('광역시', '').replace('도', '')
}

// 리스트 내 최대 절댓값
function getMax(entries: TrendEntry[]): number {
  return Math.max(...entries.map(e => Math.abs(e.change)), 1)
}

function TrendList({
  entries,
  type,
  period,
}: {
  entries: TrendEntry[]
  type: 'gainers' | 'losers'
  period: Period
}) {
  const isGainer = type === 'gainers'
  const maxChange = getMax(entries)
  const accentColor = isGainer ? 'var(--color-positive)' : 'var(--color-negative)'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={type + period}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
      >
        {/* 헤더 */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span style={{ fontSize: 18 }}>{isGainer ? '📈' : '📉'}</span>
          <p className="text-[14px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {isGainer ? '급증 TOP 10' : '급감 TOP 10'}
          </p>
        </div>

        {/* 아이템 목록 */}
        {entries.map((e, i) => {
          const barPct = Math.min(100, (Math.abs(e.change) / maxChange) * 100)

          return (
            <motion.div
              key={e.region.code}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: EASE, delay: Math.min(i * 0.03, 0.3) }}
            >
              <Link
                href={regionPath(e.region.sido, e.region.sigungu)}
                className="hover:bg-[var(--color-surface)]"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px 9px 14px',
                  borderBottom: i < entries.length - 1 ? '1px solid var(--color-border)' : 'none',
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
                    backgroundColor: accentColor,
                    opacity: 0.5,
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
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                      {e.region.sigungu}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                      {shortenSido(e.region.sido)}
                    </p>
                  </div>
                </div>

                {/* 오른쪽: 증감 수치 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: accentColor,
                        lineHeight: 1.3,
                      }}
                    >
                      {e.change >= 0 ? '+' : ''}{e.change.toLocaleString('ko-KR')}명
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: accentColor,
                        opacity: 0.75,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {e.changeRate >= 0 ? '+' : ''}{e.changeRate.toFixed(2)}%
                    </p>
                  </div>
                  <ChevronRight size={15} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}

export function TrendingClient({ data, latestYm }: Props) {
  const [period, setPeriod] = useState<Period>(12)
  const { gainers, losers } = data[period]

  return (
    <div>
      {/* ── 기간 토글 (sliding indicator) ── */}
      <div
        style={{
          display: 'inline-flex',
          gap: 0,
          borderRadius: 12,
          backgroundColor: 'var(--color-surface)',
          padding: 4,
          marginBottom: 16,
          position: 'relative',
        }}
      >
        {PERIOD_OPTIONS.map(opt => {
          const active = period === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              style={{
                position: 'relative',
                padding: '7px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: 'transparent',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                zIndex: 1,
                transition: 'color 0.18s',
              }}
            >
              {active && (
                <motion.div
                  layoutId="trendingPeriodBg"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 8,
                    backgroundColor: 'var(--color-bg)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.09)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                />
              )}
              {opt.label}
            </button>
          )
        })}
      </div>

      <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
        기준: {formatYM(latestYm)} · {period}개월 전 대비
      </p>

      <div className="space-y-4">
        <TrendList entries={gainers} type="gainers" period={period} />
        <TrendList entries={losers}  type="losers"  period={period} />
      </div>
    </div>
  )
}
