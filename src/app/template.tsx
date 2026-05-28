'use client'

import { motion, useReducedMotion } from 'motion/react'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduce ? 0.01 : 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
