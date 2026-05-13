'use client'

import { useState, useEffect, startTransition } from 'react'
import { AgeChart } from './AgeChart'
import { fetchAgeGroups } from '@/lib/actions'
import type { AgeGroup } from '@/lib/types'

interface Props {
  regionCode: string
  currentAgeGroups: AgeGroup[]
  currentMonth: string
  availableMonths: string[]
}

function formatYM(ym: string) {
  return `${ym.slice(0, 4)}.${parseInt(ym.slice(4))}`
}

export function AgeCompareTab({ regionCode, currentAgeGroups, currentMonth, availableMonths }: Props) {
  const otherMonths = availableMonths.filter(m => m !== currentMonth)
  const curIdx = availableMonths.indexOf(currentMonth)
  const defaultCmpYm = availableMonths[Math.max(0, curIdx - 24)] !== currentMonth
    ? availableMonths[Math.max(0, curIdx - 24)]
    : otherMonths[0] ?? ''

  const [compareYm, setCompareYm] = useState(defaultCmpYm)
  const [compareData, setCompareData] = useState<AgeGroup[] | null>(null)

  useEffect(() => {
    if (!compareYm) return
    fetchAgeGroups(regionCode, compareYm).then(data => {
      startTransition(() => setCompareData(data))
    })
  }, [regionCode, compareYm])

  return (
    <div>
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
              className="text-[11px] font-semibold bg-transparent appearance-none cursor-pointer"
              style={{ color: '#7c3aed' }}
            >
              {otherMonths.map(m => (
                <option key={m} value={m}>{formatYM(m)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {compareData && (
        <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
          <span>진한색: {formatYM(currentMonth)}</span>
          <span>연한색: {formatYM(compareYm)}</span>
        </div>
      )}

      <AgeChart data={currentAgeGroups} compareData={compareData ?? undefined} />
    </div>
  )
}
