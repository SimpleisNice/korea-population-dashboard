'use client'

import { useEffect, useState, startTransition } from 'react'
import Link from 'next/link'
import { Bookmark, ChevronRight } from 'lucide-react'
import { regionPath } from '@/lib/utils'
import { getFavorites } from '@/lib/favorites'
import type { FavoriteRegion } from '@/lib/favorites'

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
      <div
        className="overflow-hidden rounded-xl border"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        {regions.map((r, i) => (
          <Link
            key={`${r.sido}-${r.sigungu}`}
            href={regionPath(r.sido, r.sigungu)}
            className="flex items-center justify-between transition-colors hover:bg-[var(--color-surface)]"
            style={{
              height: 64,
              padding: '0 18px',
              borderBottom: i < regions.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <div className="flex items-baseline gap-2">
              <span
                className="text-[15px] font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {r.sigungu}
              </span>
              <span className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                {r.sido}
              </span>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </section>
  )
}
