'use client'

import { motion } from 'motion/react'
import { formatNumber } from '@/lib/utils'
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

  return (
    <motion.div
      className="flex-1 rounded-xl"
      whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.10)', y: -1 }}
      transition={{ duration: 0.2 }}
      style={{
        backgroundColor: 'var(--color-bg)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        padding: '18px 20px',
      }}
    >
      <p
        className="text-[13px] font-medium"
        style={{ color: 'var(--color-text-secondary)', margin: '0 0 8px' }}
      >
        {label}
      </p>

      <p
        style={{
          fontSize: small ? 30 : 34,
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {typeof value === 'number' ? (
          <AnimatedNumber
            value={value}
            toFixed={toFixed}
            duration={1.2}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          />
        ) : (
          value
        )}
        {unit && (
          <span style={{ fontSize: 14, fontWeight: 500, marginLeft: 3 }}>
            {unit}
          </span>
        )}
      </p>

      {change !== undefined && (
        <p
          className="text-[13px] font-semibold"
          style={{ margin: '8px 0 0', color: changeColor }}
        >
          {isPositive ? '▲' : isNegative ? '▼' : '–'}{' '}
          {toFixed !== undefined
            ? Math.abs(change).toFixed(toFixed)
            : Math.abs(change).toLocaleString('ko-KR')}{' '}
          전월비
        </p>
      )}
      {yoyChange != null && (
        <p
          className="text-[12px] font-medium"
          style={{ margin: '3px 0 0', color: yoyColor }}
        >
          {isYoyPositive ? '▲' : isYoyNegative ? '▼' : '–'}{' '}
          {toFixed !== undefined
            ? Math.abs(yoyChange).toFixed(toFixed)
            : Math.abs(yoyChange).toLocaleString('ko-KR')}{' '}
          전년비
        </p>
      )}
    </motion.div>
  )
}
