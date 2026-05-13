'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { isFavorite, toggleFavorite } from '@/lib/favorites'

interface Props {
  sido: string
  sigungu: string
}

export function BookmarkButton({ sido, sigungu }: Props) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isFavorite(sido, sigungu))
  }, [sido, sigungu])

  function handleClick() {
    setSaved(toggleFavorite(sido, sigungu))
  }

  return (
    <button
      onClick={handleClick}
      className="flex h-9 w-9 items-center justify-center rounded-full"
      style={{ color: saved ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
      aria-label={saved ? '관심 지역 해제' : '관심 지역 추가'}
    >
      <Bookmark
        size={20}
        fill={saved ? 'var(--color-accent)' : 'none'}
        strokeWidth={saved ? 0 : 2}
      />
    </button>
  )
}
