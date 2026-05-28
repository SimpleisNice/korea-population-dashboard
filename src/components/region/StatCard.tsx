'use client'

import { motion } from 'motion/react'
import { formatCompact } from '@/lib/utils'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

interface Props {
  label: string
  value: number | string
  change?: number
  yoyChange?: number | null
  unit?: string
  small?: boolean
  /** 소수점 자릿수 (세대당 인구 등 float 값에 사용) */
  toFixed?: number
}

export function StatCard({ label, value, change, yoyChange, unit, small, toFixed }: Props) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isYoyPositive = yoyChange != null && yoyChange > 0
  const isYoyNegative = yoyChange != null && yoyChange < 0

  const changeColor = isPositive
    ? 'var(--color-positive)'
    : isNegative
      ? 'var(--color-negative)'
      : 'var(--color-neutral)'
  const yoyColor = isYoyPositive
    ? 'var(--color-positive)'
    : isYoyNegative
      ? 'var(--color-negative)'
      : 'var(--color-neutral)'

  // 10,000 이상 정수값 → 만단위 압축 표기로 overflow 방지
  const useCompact = typeof value === 'number' && toFixed === undefined && value >= 10000
  // AnimatedNumber에서 쓸 만단위 formatter
  // (0 → target 애니메이션 중간도 만단위로 표시)
  const compactFormatter = useCompact
    ? (n: number) => (n / 10000).toFixed(1) + '만'
    : undefined

  // change도 10,000 이상이면 압축
  const fmtChange = (v: number) =>
    toFixed !== undefined
      ? Math.abs(v).toFixed(toFixed)
      : formatCompact(Math.abs(v))

  return (
    <motion.div
      className="flex-1 rounded-xl"
      whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)', y: -2 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        backgroundColor: 'var(--color-bg)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        padding: '16px 14px',
        minWidth: 0,   // flex 자식이 부모를 초과하지 않도록
        overflow: 'hidden',
      }}
    >
      <p
        className="text-[12px] font-medium"
        style={{ color: 'var(--color-text-secondary)', margin: '0 0 6px', whiteSpace: 'nowrap' }}
      >
        {label}
      </p>

      {/* 숫자 영역 — flex로 단위 텍스트와 나란히 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 2,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontSize: small ? 26 : 30,
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 1,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {typeof value === 'number' ? (
            <AnimatedNumber
              value={value}
              formatter={compactFormatter}
              toFixed={toFixed}
              duration={1.2}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            />
          ) : (
            value
          )}
        </span>
        {unit && (
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', flexShrink: 0 }}>
            {unit}
          </span>
        )}
      </div>

      {change !== undefined && (
        <p
          className="text-[12px] font-semibold"
          style={{ margin: '6px 0 0', color: changeColor, whiteSpace: 'nowrap' }}
        >
          {isPositive ? '▲' : isNegative ? '▼' : '–'}{' '}
          {fmtChange(change)}{' '}
          전월비
        </p>
      )}
      {yoyChange != null && (
        <p
          className="text-[11px] font-medium"
          style={{ margin: '2px 0 0', color: yoyColor, whiteSpace: 'nowrap' }}
        >
          {isYoyPositive ? '▲' : isYoyNegative ? '▼' : '–'}{' '}
          {fmtChange(yoyChange)}{' '}
          전년비
        </p>
      )}
    </motion.div>
  )
}
