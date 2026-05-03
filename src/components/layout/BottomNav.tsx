'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function HomeIcon({ active }: { active: boolean }) {
  const color = active ? '#2563EB' : '#6B7280'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function CompareIcon({ active }: { active: boolean }) {
  const color = active ? '#2563EB' : '#6B7280'
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
  const isCompare = pathname.startsWith('/compare')

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
        background: '#ffffff',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: 10,
        zIndex: 50,
      }}
    >
      <Link
        href="/"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          textDecoration: 'none',
        }}
      >
        <HomeIcon active={!isCompare} />
        <span style={{ fontSize: 10, fontWeight: 500, color: !isCompare ? '#2563EB' : '#6B7280' }}>홈</span>
      </Link>
      <Link
        href="/compare"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          textDecoration: 'none',
        }}
      >
        <CompareIcon active={isCompare} />
        <span style={{ fontSize: 10, fontWeight: 500, color: isCompare ? '#2563EB' : '#6B7280' }}>비교</span>
      </Link>
    </nav>
  )
}
