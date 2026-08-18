'use client'

import { useSyncExternalStore } from 'react'
import { Bookmark } from 'lucide-react'
import { isFavorite, toggleFavorite, subscribeFavorites } from '@/lib/favorites'

interface Props {
  sido: string
  sigungu: string
}

export function BookmarkButton({ sido, sigungu }: Props) {
  // localStorage 는 React 밖의 저장소다. useEffect 로 읽어 state 에 옮기면 렌더가
  // 한 번 더 돌고, 다른 곳에서 즐겨찾기가 바뀌어도 이 버튼은 모른다.
  // useSyncExternalStore 가 그 두 문제를 함께 해결한다.
  // 서버 스냅샷은 false — 서버는 사용자의 즐겨찾기를 알 수 없다.
  const saved = useSyncExternalStore(
    subscribeFavorites,
    () => isFavorite(sido, sigungu),
    () => false,
  )

  return (
    <button
      onClick={() => toggleFavorite(sido, sigungu)}
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
