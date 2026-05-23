'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function RankingIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function MapIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function CompareIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const isRanking = pathname.startsWith('/ranking') || pathname.startsWith('/trending')
  const isCompare = pathname.startsWith('/compare')
  const isMap = pathname.startsWith('/map')
  const isHome = !isRanking && !isCompare && !isMap

  const ac = 'var(--color-accent)'
  const sc = 'var(--color-text-secondary)'

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 'var(--max-w)',
        height: 72,
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: 10,
        zIndex: 50,
      }}
    >
      <Link href="/" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <HomeIcon color={isHome ? ac : sc} />
        <span style={{ fontSize: 11, fontWeight: 500, color: isHome ? ac : sc }}>홈</span>
      </Link>
      <Link href="/map" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <MapIcon color={isMap ? ac : sc} />
        <span style={{ fontSize: 11, fontWeight: 500, color: isMap ? ac : sc }}>지도</span>
      </Link>
      <Link href="/ranking" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <RankingIcon color={isRanking ? ac : sc} />
        <span style={{ fontSize: 11, fontWeight: 500, color: isRanking ? ac : sc }}>순위</span>
      </Link>
      <Link href="/compare" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <CompareIcon color={isCompare ? ac : sc} />
        <span style={{ fontSize: 11, fontWeight: 500, color: isCompare ? ac : sc }}>비교</span>
      </Link>
    </nav>
  )
}
