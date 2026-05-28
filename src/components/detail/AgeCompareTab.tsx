'use client'

import { useState, useEffect, startTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AgeChart } from './AgeChart'
import { Skeleton } from '@/components/ui/Skeleton'
import { fetchAgeGroups } from '@/lib/actions'
import type { AgeGroup } from '@/lib/types'

interface Props {
  regionCode: string
  currentAgeGroups: AgeGroup[]
  currentMonth: string
  availableMonths: string[]
}

function formatYM(ym: string) {
  return `${ym.slice(2, 4)}.${ym.slice(4)}`
}

function calcAgingIndex(groups: AgeGroup[]): number | null {
  const ELDERLY = ['60–69', '70–79', '80+']
  const YOUTH = ['0–9', '10–19']
  const elderly = groups.filter(g => ELDERLY.includes(g.label)).reduce((s, g) => s + g.male + g.female, 0)
  const youth = groups.filter(g => YOUTH.includes(g.label)).reduce((s, g) => s + g.male + g.female, 0)
  if (youth === 0) return null
  return Math.round(elderly / youth * 100)
}

export function AgeCompareTab({ regionCode, currentAgeGroups, currentMonth, availableMonths }: Props) {
  const otherMonths = availableMonths.filter(m => m !== currentMonth)
  const curIdx = availableMonths.indexOf(currentMonth)
  const defaultCmpYm = availableMonths[Math.max(0, curIdx - 24)] !== currentMonth
    ? availableMonths[Math.max(0, curIdx - 24)]
    : otherMonths[0] ?? ''

  const [compareYm, setCompareYm] = useState(defaultCmpYm)
  const [compareData, setCompareData] = useState<AgeGroup[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!compareYm) return
    setLoading(true)
    fetchAgeGroups(regionCode, compareYm).then(data => {
      startTransition(() => {
        setCompareData(data)
        setLoading(false)
      })
    })
  }, [regionCode, compareYm])

  const currentIndex = calcAgingIndex(currentAgeGroups)
  const compareIndex = compareData ? calcAgingIndex(compareData) : null
  const indexDiff = currentIndex !== null && compareIndex !== null ? currentIndex - compareIndex : null

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          연령별 인구 구조
        </p>
        {otherMonths.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>비교:</span>
            <select
              value={compareYm}
              onChange={e => setCompareYm(e.target.value)}
              disabled={loading}
              className="text-[11px] font-semibold bg-transparent appearance-none cursor-pointer"
              style={{ color: 'var(--color-accent)', opacity: loading ? 0.5 : 1, transition: 'opacity 0.15s' }}
            >
              {otherMonths.map(m => (
                <option key={m} value={m}>{formatYM(m)}</option>
              ))}
            </select>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  width: 12, height: 12, borderRadius: '50%',
                  border: '2px solid var(--color-border)',
                  borderTopColor: 'var(--color-accent)',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* 고령화 지수 비교 */}
      {compareData && currentIndex !== null && compareIndex !== null && (
        <div
          className="flex items-center gap-3 rounded-lg"
          style={{
            backgroundColor: 'var(--color-surface)',
            padding: '10px 14px',
            marginBottom: 12,
          }}
        >
          <div className="text-center flex-1">
            <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}>
              {formatYM(compareYm)} 고령화 지수
            </p>
            <p className="text-[15px] font-bold" style={{ color: 'var(--color-accent)' }}>
              {compareIndex}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-[13px] font-bold"
              style={{
                color: (indexDiff ?? 0) > 0 ? 'var(--color-negative)'
                  : (indexDiff ?? 0) < 0 ? 'var(--color-positive)'
                  : 'var(--color-text-secondary)',
              }}
            >
              {(indexDiff ?? 0) > 0 ? `+${indexDiff}` : indexDiff}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>변화</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}>
              {formatYM(currentMonth)} 고령화 지수
            </p>
            <p
              className="text-[15px] font-bold"
              style={{ color: currentIndex > 100 ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
            >
              {currentIndex}
            </p>
          </div>
        </div>
      )}

      {/* 범례 */}
      {compareData && (
        <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
          <span>진한색: {formatYM(currentMonth)}</span>
          <span>연한색: {formatYM(compareYm)}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} height={20} width={`${60 + Math.random() * 35}%`} rounded={4} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="chart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <AgeChart data={currentAgeGroups} compareData={compareData ?? undefined} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
