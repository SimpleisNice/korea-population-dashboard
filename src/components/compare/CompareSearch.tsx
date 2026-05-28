'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Fuse from 'fuse.js'
import { Search, X } from 'lucide-react'
import type { Region } from '@/lib/types'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

interface Props {
  regions: Region[]
  label: 'A' | 'B'
  selected: Region | null
  onSelect: (r: Region) => void
  onClear: () => void
}

export function CompareSearch({ regions, label, selected, onSelect, onClear }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const fuse = useMemo(
    () => new Fuse(regions, { keys: ['sigungu', 'sido'], threshold: 0.35 }),
    [regions]
  )

  const results = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query).slice(0, 6).map(r => r.item)
  }, [fuse, query])

  const accentColor = label === 'A' ? 'var(--color-accent)' : 'var(--color-accent-b)'

  if (selected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="flex items-center justify-between rounded-xl border px-4 py-3"
        style={{ borderColor: accentColor, backgroundColor: 'var(--color-bg)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: accentColor }}
          >
            {label}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {selected.sigungu}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {selected.sido}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          onClick={onClear}
          aria-label="선택 해제"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <X size={15} style={{ color: 'var(--color-text-secondary)' }} />
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 rounded-xl border px-4 py-3"
        style={{
          borderColor: open ? accentColor : 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          transition: 'border-color 0.18s',
        }}
      >
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {label}
        </span>
        <input
          type="text"
          placeholder={`지역 ${label} 검색`}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-secondary)]"
          style={{ color: 'var(--color-text-primary)' }}
        />
        <Search size={16} style={{ color: 'var(--color-text-secondary)' }} />
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border shadow-lg"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
          >
            {results.map((region, i) => (
              <motion.li
                key={region.code}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2, ease: EASE }}
              >
                <button
                  className="w-full px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--color-surface)]"
                  onMouseDown={() => { onSelect(region); setQuery('') }}
                >
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {region.sigungu}
                  </span>
                  <span className="ml-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {region.sido}
                  </span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
