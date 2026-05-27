'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-accent)' : 'var(--color-text-secondary)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function RankingIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-accent)' : 'var(--color-text-secondary)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function MapIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-accent)' : 'var(--color-text-secondary)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function CompareIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-accent)' : 'var(--color-text-secondary)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

const TABS = [
  {
    href: '/',
    label: '홈',
    Icon: HomeIcon,
    isActive: (p: string) =>
      !p.startsWith('/ranking') &&
      !p.startsWith('/trending') &&
      !p.startsWith('/compare') &&
      !p.startsWith('/map'),
  },
  { href: '/map',     label: '지도', Icon: MapIcon,     isActive: (p: string) => p.startsWith('/map') },
  { href: '/ranking', label: '순위', Icon: RankingIcon, isActive: (p: string) => p.startsWith('/ranking') || p.startsWith('/trending') },
  { href: '/compare', label: '비교', Icon: CompareIcon, isActive: (p: string) => p.startsWith('/compare') },
]

export function BottomNav() {
  const pathname = usePathname()

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
      {TABS.map(({ href, label, Icon, isActive }) => {
        const active = isActive(pathname)
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              position: 'relative',
            }}
          >
            {/* 상단 indicator bar (spring으로 탭 간 이동) */}
            {active && (
              <motion.div
                layoutId="navIndicator"
                style={{
                  position: 'absolute',
                  top: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 2.5,
                  borderRadius: 99,
                  backgroundColor: 'var(--color-accent)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}

            {/* 아이콘 + 라벨 (탭 press 효과) */}
            <motion.div
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <motion.div
                animate={{ scale: active ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Icon active={active} />
              </motion.div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  transition: 'color 0.2s ease, font-weight 0.2s ease',
                }}
              >
                {label}
              </span>
            </motion.div>
          </Link>
        )
      })}
    </nav>
  )
}
