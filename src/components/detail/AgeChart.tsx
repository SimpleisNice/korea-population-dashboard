'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import type { AgeGroup } from '@/lib/types'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

interface Props {
  data: AgeGroup[]
  compareData?: AgeGroup[]
}

export function AgeChart({ data, compareData }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  const allVals = [
    ...data.flatMap((d) => [d.male, d.female]),
    ...(compareData ?? []).flatMap((d) => [d.male, d.female]),
  ]
  const maxVal = Math.max(...allVals)
  const total = data.reduce((s, d) => s + d.male + d.female, 0)

  const barH = 18
  const gap = 8
  const padL = 44
  const padR = 60
  const barGap = 2
  const W = 360
  const totalH = data.length * (barH * 2 + gap + barGap) + 28

  return (
    <div ref={ref} style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${totalH}`} style={{ width: '100%' }}>
        {/* 범례 */}
        <rect x={padL} y={4} width={8} height={8} rx={2} fill="#2563EB" fillOpacity="0.85" />
        <text x={padL + 12} y={12} fontSize="9" fill="#6B7280">남자</text>
        <rect x={padL + 46} y={4} width={8} height={8} rx={2} fill="#F97316" fillOpacity="0.8" />
        <text x={padL + 58} y={12} fontSize="9" fill="#6B7280">여자</text>
        {compareData && (
          <>
            <rect x={padL + 96} y={4} width={8} height={8} rx={2} fill="#9CA3AF" fillOpacity="0.4" />
            <text x={padL + 108} y={12} fontSize="9" fill="#6B7280">비교</text>
          </>
        )}

        {data.map((d, i) => {
          const cmp = compareData?.[i]
          const y = 28 + i * (barH * 2 + gap + barGap)
          const availW = W - padL - padR
          const mW = maxVal > 0 ? Math.max(2, (d.male / maxVal) * availW) : 2
          const fW = maxVal > 0 ? Math.max(2, (d.female / maxVal) * availW) : 2
          const cmW = cmp && maxVal > 0 ? Math.max(2, (cmp.male / maxVal) * availW) : 0
          const cfW = cmp && maxVal > 0 ? Math.max(2, (cmp.female / maxVal) * availW) : 0
          const groupTotal = d.male + d.female
          const pct = total > 0 ? ((groupTotal / total) * 100).toFixed(1) : '0'

          // 행마다 딜레이 증가 (연령대 순으로 스태거)
          const rowDelay = 0.06 + i * 0.055

          return (
            <g key={d.label}>
              {/* 연령대 레이블 */}
              <text
                x={padL - 4}
                y={y + barH - 3}
                textAnchor="end"
                fontSize="9"
                fill="#6B7280"
              >
                {d.label}
              </text>

              {/* 비교 시점 막대 (배경) — 약간 빠른 딜레이로 먼저 그린 뒤 현재 막대 위에 덮임 */}
              {cmp && cmW > 0 && (
                <motion.rect
                  x={padL}
                  y={y}
                  height={barH}
                  rx={2}
                  fill="#2563EB"
                  fillOpacity={0.2}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: cmW } : { width: 0 }}
                  transition={{ delay: rowDelay - 0.03, duration: 0.55, ease: EASE }}
                />
              )}
              {cmp && cfW > 0 && (
                <motion.rect
                  x={padL}
                  y={y + barH + barGap}
                  height={barH}
                  rx={2}
                  fill="#F97316"
                  fillOpacity={0.18}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: cfW } : { width: 0 }}
                  transition={{ delay: rowDelay - 0.03, duration: 0.55, ease: EASE }}
                />
              )}

              {/* 현재 시점 남자 막대 */}
              <motion.rect
                x={padL}
                y={y}
                height={barH}
                rx={2}
                fill="#2563EB"
                fillOpacity={0.85}
                initial={{ width: 0 }}
                animate={isInView ? { width: mW } : { width: 0 }}
                transition={{ delay: rowDelay, duration: 0.55, ease: EASE }}
              />

              {/* 현재 시점 여자 막대 */}
              <motion.rect
                x={padL}
                y={y + barH + barGap}
                height={barH}
                rx={2}
                fill="#F97316"
                fillOpacity={0.8}
                initial={{ width: 0 }}
                animate={isInView ? { width: fW } : { width: 0 }}
                transition={{ delay: rowDelay + 0.04, duration: 0.55, ease: EASE }}
              />

              {/* 퍼센트 레이블 — 막대 다 그려진 후 fade-in */}
              <motion.text
                x={W - padR + 4}
                y={y + barH - 3}
                fontSize="9"
                fill="#9CA3AF"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: rowDelay + 0.25, duration: 0.3, ease: EASE }}
              >
                {pct}%
              </motion.text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
