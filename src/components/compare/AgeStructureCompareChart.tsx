'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import type { AgeGroup } from '@/lib/types'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

interface Props {
  a: AgeGroup[]
  b: AgeGroup[]
  labelA: string
  labelB: string
  colorA: string
  colorB: string
}

// 지역 A/B의 연령대별 인구 구성비를 같은 축 위에서 직접 비교한다.
// (성별 분리 없이 연령대 합계만 사용 — 성비는 비교 테이블에 별도 지표로 이미 존재)
export function AgeStructureCompareChart({ a, b, labelA, labelB, colorA, colorB }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  const totalA = a.reduce((s, g) => s + g.male + g.female, 0)
  const totalB = b.reduce((s, g) => s + g.male + g.female, 0)

  const rows = a.map((g, i) => {
    const gb = b[i]
    const sumA = g.male + g.female
    const sumB = gb ? gb.male + gb.female : 0
    return {
      label: g.label,
      sumA,
      sumB,
      pctA: totalA > 0 ? (sumA / totalA) * 100 : 0,
      pctB: totalB > 0 ? (sumB / totalB) * 100 : 0,
    }
  })

  const maxPct = Math.max(1, ...rows.map(r => Math.max(r.pctA, r.pctB)))

  const barH = 14
  const barGap = 3
  const rowGap = 10
  const padL = 44
  const padR = 76
  const W = 360
  const totalH = rows.length * (barH * 2 + barGap + rowGap) + 24

  return (
    <div ref={ref} style={{ overflowX: 'auto' }}>
      <div className="flex items-center gap-3" style={{ marginBottom: 8, fontSize: 11, color: 'var(--color-text-secondary)' }}>
        <span className="flex items-center gap-1">
          <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colorA, display: 'inline-block' }} />
          {labelA}
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colorB, display: 'inline-block' }} />
          {labelB}
        </span>
        <span style={{ marginLeft: 'auto' }}>연령대별 구성비 (%)</span>
      </div>

      <svg viewBox={`0 0 ${W} ${totalH}`} style={{ width: '100%' }}>
        {rows.map((r, i) => {
          const y = 12 + i * (barH * 2 + barGap + rowGap)
          const availW = W - padL - padR
          const wA = maxPct > 0 ? Math.max(2, (r.pctA / maxPct) * availW) : 2
          const wB = maxPct > 0 ? Math.max(2, (r.pctB / maxPct) * availW) : 2
          const rowDelay = 0.05 + i * 0.05

          return (
            <g key={r.label}>
              <text x={padL - 4} y={y + barH - 2} textAnchor="end" fontSize="9" fill="#6B7280">
                {r.label}
              </text>

              <motion.rect
                x={padL}
                y={y}
                height={barH}
                rx={2}
                fill={colorA}
                initial={{ width: 0 }}
                animate={isInView ? { width: wA } : { width: 0 }}
                transition={{ delay: rowDelay, duration: 0.5, ease: EASE }}
              />
              <motion.text
                x={padL + availW + 6}
                y={y + barH - 2}
                fontSize="9"
                fill={colorA}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: rowDelay + 0.25, duration: 0.3 }}
              >
                {r.pctA.toFixed(1)}%
              </motion.text>

              <motion.rect
                x={padL}
                y={y + barH + barGap}
                height={barH}
                rx={2}
                fill={colorB}
                initial={{ width: 0 }}
                animate={isInView ? { width: wB } : { width: 0 }}
                transition={{ delay: rowDelay + 0.05, duration: 0.5, ease: EASE }}
              />
              <motion.text
                x={padL + availW + 6}
                y={y + barH * 2 + barGap - 2}
                fontSize="9"
                fill={colorB}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: rowDelay + 0.3, duration: 0.3 }}
              >
                {r.pctB.toFixed(1)}%
              </motion.text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
