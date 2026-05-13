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
    return false
  }
  const next = [{ sido, sigungu }, ...favs].slice(0, MAX_FAVORITES)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
  return true
}
