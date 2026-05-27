'use client'

import { useEffect, useState, startTransition } from 'react'
import Link from 'next/link'
import { Bookmark, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { regionPath } from '@/lib/utils'
import { getFavorites } from '@/lib/favorites'
import type { FavoriteRegion } from '@/lib/favorites'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
}

export function FavoriteRegions() {
  const [regions, setRegions] = useState<FavoriteRegion[]>([])

  useEffect(() => {
    startTransition(() => setRegions(getFavorites()))
  }, [])

  if (regions.length === 0) return null

  return (
    <section style={{ marginBottom: 28 }}>
      <div className="mb-3 flex items-center gap-1.5">
        <Bookmark size={13} style={{ color: 'var(--color-text-secondary)' }} />
        <p className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          관심 지역
        </p>
      </div>
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="overflow-hidden rounded-xl border"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        {regions.map((r, i) => (
          <motion.div key={`${r.sido}-${r.sigungu}`} variants={itemVariants}>
            <Link
              href={regionPath(r.sido, r.sigungu)}
              className="flex items-center justify-between transition-colors hover:bg-[var(--color-surface)] group"
              style={{
                height: 64,
                padding: '0 18px',
                borderBottom: i < regions.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {r.sigungu}
                </span>
                <span className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {r.sido}
                </span>
              </div>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <ChevronRight size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
