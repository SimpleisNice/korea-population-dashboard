'use client'

import { useState, useRef, useEffect } from 'react'
import Fuse from 'fuse.js'
import { Search, X } from 'lucide-react'
import type { Region } from '@/lib/types'

interface Props {
  regions: Region[]
  label: 'A' | 'B'
  selected: Region | null
  onSelect: (r: Region) => void
  onClear: () => void
}

export function CompareSearch({ regions, label, selected, onSelect, onClear }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Region[]>([])
  const [open, setOpen] = useState(false)

  const fuse = useRef(
    new Fuse(regions, { keys: ['sigungu', 'sido'], threshold: 0.35 })
  )

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setResults(fuse.current.search(query).slice(0, 6).map(r => r.item))
  }, [query])

  const accentColor = label === 'A' ? 'var(--color-accent)' : '#7c3aed'

  if (selected) {
    return (
      <div
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
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {selected.sigungu}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {selected.sido}
          </span>
        </div>
        <button onClick={onClear} aria-label="선택 해제">
          <X size={16} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 rounded-xl border px-4 py-3"
        style={{
          borderColor: open ? accentColor : 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
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

      {open && results.length > 0 && (
        <ul
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border shadow-lg"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
        >
          {results.map(region => (
            <li key={region.code}>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
