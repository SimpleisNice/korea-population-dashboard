export interface FavoriteRegion {
  sido: string
  sigungu: string
}

const FAVORITES_KEY = 'favorite_regions'
const MAX_FAVORITES = 10

export function getFavorites(): FavoriteRegion[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function isFavorite(sido: string, sigungu: string): boolean {
  return getFavorites().some(r => r.sido === sido && r.sigungu === sigungu)
}

export function toggleFavorite(sido: string, sigungu: string): boolean {
  const favs = getFavorites()
  const exists = favs.some(r => r.sido === sido && r.sigungu === sigungu)
  if (exists) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(
      favs.filter(r => !(r.sido === sido && r.sigungu === sigungu))
    ))
    notify()
    return false
  }
  const next = [{ sido, sigungu }, ...favs].slice(0, MAX_FAVORITES)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
  notify()
  return true
}

// ── 구독 ─────────────────────────────────────────────────────────────────────
// localStorage 는 React 밖의 저장소다. 컴포넌트가 useEffect 로 읽어 state 에 옮기면
// 렌더 → 이펙트 → 재렌더가 한 번 더 돌고, 다른 곳에서 즐겨찾기를 바꿔도 갱신되지 않는다.
// useSyncExternalStore 로 읽도록 구독 지점을 제공한다.

type Listener = () => void
const listeners = new Set<Listener>()

/** 즐겨찾기 변경을 구독한다. 다른 탭에서의 변경(storage 이벤트)도 함께 받는다. */
export function subscribeFavorites(listener: Listener): () => void {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === FAVORITES_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function notify() {
  for (const listener of listeners) listener()
}
