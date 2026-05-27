'use client'

import { useState, useEffect, useCallback, useMemo, startTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { fetchMonthStats } from '@/lib/actions'
import { formatCompact, formatYM } from '@/lib/utils'
import type { MonthlyStats } from '@/lib/types'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

interface Props {
  regionCode: string
  currentMonth: string
  availableMonths: string[]
  currentStats: MonthlyStats
}

// ── 서브 컴포넌트 ──────────────────────────────────────────────────────────────

function DiffBadge({ a, b }: { a: number; b: number }) {
  const diff = a - b
  if (diff === 0) {
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          backgroundColor: 'var(--color-surface)',
          padding: '1px 5px',
          borderRadius: 4,
        }}
      >
        변화없음
      </span>
    )
  }
  const pct = b !== 0 ? ((diff / b) * 100).toFixed(1) : null
  const isPos = diff > 0
  const color = isPos ? 'var(--color-positive)' : 'var(--color-negative)'
  const bg    = isPos ? 'var(--color-positive-light)' : 'var(--color-negative-light)'
  return (
    <span
      style={{
        fontSize: 10,
        color,
        fontWeight: 700,
        backgroundColor: bg,
        padding: '1px 5px',
        borderRadius: 4,
        display: 'inline-block',
      }}
    >
      {isPos ? '▲' : '▼'} {formatCompact(Math.abs(diff))}
      {pct != null ? ` (${pct}%)` : ''}
    </span>
  )
}

function Row({
  label,
  cur,
  cmp,
  index,
  isFloat,
}: {
  label: string
  cur: number
  cmp: number
  index: number
  isFloat?: boolean
}) {
  const fmtCur = isFloat ? cur.toFixed(2) : formatCompact(cur)
  const fmtCmp = isFloat ? cmp.toFixed(2) : formatCompact(cmp)

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE, delay: index * 0.04 }}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 8,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottom: '1px solid var(--color-border)',
      }}
      className="last:border-b-0"
    >
      {/* 현재 (파란) */}
      <div style={{ textAlign: 'right' }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: 'var(--color-accent)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.2,
          }}
        >
          {fmtCur}
        </p>
        <DiffBadge a={cur} b={cmp} />
      </div>

      {/* 라벨 (중앙) */}
      <p
        style={{
          fontSize: 11,
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}
      >
        {label}
      </p>

      {/* 비교 (회색) */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {fmtCmp}
      </p>
    </motion.div>
  )
}

function SkeletonRows() {
  return (
    <div style={{ padding: '0 16px' }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 8,
            paddingTop: 10,
            paddingBottom: 10,
            borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none',
          }}
        >
          {[0, 1, 2].map(j => (
            <motion.div
              key={j}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 + j * 0.05 }}
              style={{
                height: 12,
                borderRadius: 4,
                backgroundColor: 'var(--color-border)',
                width: j === 1 ? 36 : 56,
                margin: j === 0 ? '0 0 0 auto' : j === 1 ? '0 auto' : 0,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────

export function TimePeriodCompare({
  regionCode,
  currentMonth,
  availableMonths,
  currentStats,
}: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const [cmpStats, setCmpStats] = useState<MonthlyStats | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [fetchError, setFetchError] = useState(false)

  // URL의 cmp, 없으면 1년 전 → 6개월 전 → 전월 순으로 기본값
  const effectiveCmp = useMemo(() => {
    const urlCmp = searchParams.get('cmp')
    if (urlCmp && availableMonths.includes(urlCmp) && urlCmp !== currentMonth) return urlCmp
    const idx = availableMonths.indexOf(currentMonth)
    for (const offset of [12, 6, 3, 1]) {
      const candidate = idx - offset >= 0 ? availableMonths[idx - offset] : null
      if (candidate && candidate !== currentMonth) return candidate
    }
    return availableMonths.find(m => m !== currentMonth) ?? ''
  }, [searchParams, availableMonths, currentMonth])

  // preset 버튼: 전월 / 6개월 전 / 1년 전
  const presets = useMemo(() => {
    const idx = availableMonths.indexOf(currentMonth)
    return [
      { label: '전월',    offset: 1  },
      { label: '6개월 전', offset: 6  },
      { label: '1년 전',  offset: 12 },
    ]
      .map(({ label, offset }) => ({
        label,
        ym: idx - offset >= 0 ? availableMonths[idx - offset] : null,
      }))
      .filter((p): p is { label: string; ym: string } => p.ym !== null && p.ym !== currentMonth)
  }, [availableMonths, currentMonth])

  const setCmp = useCallback(
    (ym: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (ym) params.set('cmp', ym)
      else params.delete('cmp')
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  // 비교 데이터 fetch
  useEffect(() => {
    if (!effectiveCmp) {
      startTransition(() => { setCmpStats(null); setFetchError(false) })
      return
    }
    startTransition(() => { setLoading(true); setFetchError(false) })
    fetchMonthStats(regionCode, effectiveCmp)
      .then(s => {
        startTransition(() => { setCmpStats(s); setLoading(false) })
      })
      .catch(() => {
        startTransition(() => { setFetchError(true); setLoading(false) })
      })
  }, [effectiveCmp, regionCode])

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: 'var(--color-bg)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 20,
        overflow: 'hidden',
      }}
    >
      {/* ── 헤더 ── */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 10,
          }}
        >
          시점 비교
        </p>

        {/* preset 빠른 선택 */}
        <div style={{ display: 'flex', gap: 6 }}>
          {presets.map(({ label, ym }) => {
            const active = effectiveCmp === ym
            return (
              <motion.button
                key={ym}
                whileTap={{ scale: 0.94 }}
                onClick={() => setCmp(ym)}
                style={{
                  padding: '4px 11px',
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: active ? 'none' : '1px solid var(--color-border)',
                  backgroundColor: active ? 'var(--color-accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--color-text-secondary)',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
              >
                {label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── 컬럼 헤더 ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          padding: '8px 16px',
          borderBottom: '1px solid var(--color-border)',
          gap: 8,
          alignItems: 'center',
        }}
      >
        {/* 현재월 */}
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-accent)',
            textAlign: 'right',
          }}
        >
          {formatYM(currentMonth)}
        </p>

        <span />

        {/* 비교월 드롭다운 */}
        <select
          value={effectiveCmp}
          onChange={e => setCmp(e.target.value)}
          style={{
            backgroundColor: 'transparent',
            fontSize: 12,
            fontWeight: 700,
            appearance: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            border: 'none',
            outline: 'none',
            padding: 0,
          }}
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

      {/* ── 비교 지표 ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SkeletonRows />
          </motion.div>
        ) : fetchError ? (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '20px 16px',
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--color-negative)',
            }}
          >
            데이터를 불러오지 못했습니다
          </motion.p>
        ) : !cmpStats ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '20px 16px',
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--color-text-secondary)',
            }}
          >
            데이터 없음
          </motion.p>
        ) : (
          <motion.div
            key={effectiveCmp}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ padding: '0 16px' }}
          >
            <Row label="총 인구"     cur={currentStats.population}    cmp={cmpStats.population}    index={0} />
            <Row label="세대수"      cur={currentStats.households}    cmp={cmpStats.households}    index={1} />
            <Row label="세대당 인구"  cur={currentStats.householdSize} cmp={cmpStats.householdSize} index={2} isFloat />
            <Row label="남자"        cur={currentStats.male}          cmp={cmpStats.male}          index={3} />
            <Row label="여자"        cur={currentStats.female}        cmp={cmpStats.female}        index={4} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
