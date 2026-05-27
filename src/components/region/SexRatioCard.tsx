'use client'

import { motion } from 'motion/react'
import { formatNumber } from '@/lib/utils'

interface Props {
  male: number
  female: number
}

export function SexRatioCard({ male, female }: Props) {
  const total = male + female
  const malePct  = total > 0 ? (male  / total) * 100 : 50
  const femalePct = total > 0 ? (female / total) * 100 : 50

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
        style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
      >
        성비 (남 / 여)
      </p>

      {/* 남성 바 */}
      <div style={{ marginBottom: 8 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--color-accent)' }}>
            남
          </span>
          <span className="text-[11px] font-bold" style={{ color: 'var(--color-accent)' }}>
            {malePct.toFixed(1)}%
          </span>
        </div>
        <div
          style={{
            height: 5,
            borderRadius: 99,
            backgroundColor: 'var(--color-surface)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${malePct}%` }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] }}
            style={{
              height: '100%',
              borderRadius: 99,
              backgroundColor: 'var(--color-accent)',
              opacity: 0.85,
            }}
          />
        </div>
      </div>

      {/* 여성 바 */}
      <div style={{ marginBottom: 12 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--color-female)' }}>
            여
          </span>
          <span className="text-[11px] font-bold" style={{ color: 'var(--color-female)' }}>
            {femalePct.toFixed(1)}%
          </span>
        </div>
        <div
          style={{
            height: 5,
            borderRadius: 99,
            backgroundColor: 'var(--color-surface)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${femalePct}%` }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] }}
            style={{
              height: '100%',
              borderRadius: 99,
              backgroundColor: 'var(--color-female)',
              opacity: 0.8,
            }}
          />
        </div>
      </div>

      {/* 절대 수치 */}
      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
        <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{formatNumber(male)}</span>
        <span style={{ margin: '0 4px', opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--color-female)', fontWeight: 600 }}>{formatNumber(female)}</span>
      </p>
    </motion.div>
  )
}
