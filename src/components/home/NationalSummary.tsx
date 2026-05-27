'use client'

import Link from 'next/link'
import { TrendingUp, BarChart2 } from 'lucide-react'
import { motion } from 'motion/react'
import type { NationalSummary as NationalSummaryType } from '@/lib/types'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

function formatYM(ym: string) {
  return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4))}월`
}

interface Props {
  summary: NationalSummaryType
}

export function NationalSummary({ summary }: Props) {
  const isPositive = summary.prevMonthChange > 0
  const isNegative = summary.prevMonthChange < 0
  const changeColor = isPositive
    ? 'var(--color-positive)'
    : isNegative
      ? 'var(--color-negative)'
      : 'var(--color-neutral)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl"
      style={{
        background:
          'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%)',
        border: '1px solid rgba(37,99,235,0.12)',
        padding: '20px 20px 16px',
      }}
    >
      {/* 라벨 */}
      <p
        className="text-[11px] font-semibold tracking-wide"
        style={{ color: 'var(--color-accent)', opacity: 0.75, marginBottom: 10 }}
      >
        전국 주민등록 인구 · {formatYM(summary.month)} 기준
      </p>

      {/* 메인 숫자 */}
      <div className="flex items-end gap-1" style={{ marginBottom: 10 }}>
        <AnimatedNumber
          value={summary.totalPopulation}
          duration={1.4}
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            paddingBottom: 3,
          }}
        >
          명
        </span>
      </div>

      {/* 전월 변화량 */}
      {summary.prevMonthChange !== 0 && (
        <div className="flex items-center gap-1.5" style={{ marginBottom: 16 }}>
          <span className="text-[12px] font-semibold" style={{ color: changeColor }}>
            {isPositive ? '▲' : '▼'}
          </span>
          <AnimatedNumber
            value={Math.abs(summary.prevMonthChange)}
            duration={1.0}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: changeColor,
              fontVariantNumeric: 'tabular-nums',
            }}
          />
          <span className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
            명 전월 대비
          </span>
        </div>
      )}

      {/* 구분선 */}
      <div
        style={{
          height: 1,
          backgroundColor: 'var(--color-border)',
          marginBottom: 14,
          opacity: 0.6,
        }}
      />

      {/* 하단 링크 칩 */}
      <div className="flex items-center gap-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/trending"
            className="flex items-center gap-1.5 rounded-full text-[12px] font-semibold"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              padding: '6px 14px',
            }}
          >
            <TrendingUp size={11} />
            급증·급감 지역
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/ranking"
            className="flex items-center gap-1.5 rounded-full text-[12px] font-semibold"
            style={{
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              padding: '6px 14px',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            <BarChart2 size={11} />
            지역 순위
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
