'use client'

import { motion } from 'motion/react'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

interface Props {
  children: React.ReactNode
  delay?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * 섹션 스태거용 얇은 motion 래퍼.
 * Server Component 페이지에서 import해서 사용 가능.
 */
export function FadeIn({ children, delay = 0, className, style }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: EASE, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
