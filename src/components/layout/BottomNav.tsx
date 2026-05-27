'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'

// ── 아이콘 ───────────────────────────────────────────────────────────────────
// active 여부에 따라 strokeWidth를 달리하여 볼드감 차이를 줌

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-accent)' : 'var(--color-text-secondary)'
  const w = active ? 2.5 : 1.8
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function RankingIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-accent)' : 'var(--color-text-secondary)'
  const w = active ? 2.5 : 1.8
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function MapIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-accent)' : 'var(--color-text-secondary)'
  const w = active ? 2.5 : 1.8
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function CompareIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--color-accent)' : 'var(--color-text-secondary)'
  const w = active ? 2.5 : 1.8
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

// ── 탭 정의 ───────────────────────────────────────────────────────────────────

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

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────

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
        // frosted glass — iOS/macOS 스타일 반투명 배경
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(229,231,235,0.7)',
        // safe area: iPhone 홈 바 침범 방지
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
        paddingTop: 8,
        paddingLeft: 4,
        paddingRight: 4,
        display: 'flex',
        alignItems: 'flex-start',
        zIndex: 50,
        minHeight: 64,
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
              gap: 4,
              textDecoration: 'none',
            }}
          >
            <motion.div
              whileTap={{ scale: 0.84 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {/* 아이콘 영역 — 활성 탭에 pill 배경 (탭별 독립 fade·scale) */}
              <div
                style={{
                  position: 'relative',
                  width: 48,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      key="pill"
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.75 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 10,
                        backgroundColor: 'var(--color-accent-light)',
                      }}
                      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  animate={{ scale: active ? 1.06 : 1, y: active ? -0.5 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <Icon active={active} />
                </motion.div>
              </div>

              {/* 라벨 */}
              <motion.span
                animate={{
                  color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}
                transition={{ duration: 0.18 }}
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  lineHeight: 1,
                }}
              >
                {label}
              </motion.span>
            </motion.div>
          </Link>
        )
      })}
    </nav>
  )
}
