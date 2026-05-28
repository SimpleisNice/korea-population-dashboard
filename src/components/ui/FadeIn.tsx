'use client'

import { motion, useReducedMotion } from 'motion/react'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

interface Props {
  children: React.ReactNode
  delay?: number
  className?: string
  style?: React.CSSProperties
}

export function FadeIn({ children, delay = 0, className, style }: Props) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduce ? 0.01 : 0.32,
        ease: EASE,
        delay: shouldReduce ? 0 : delay,
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
