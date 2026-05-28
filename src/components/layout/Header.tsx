'use client'

import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  backHref?: string
  showSearch?: boolean
  right?: React.ReactNode
}

export function Header({ title, showBack, backHref = '/', showSearch, right }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className="sticky top-0 z-40 flex h-14 items-center gap-1 px-2"
      animate={{
        boxShadow: scrolled
          ? '0 1px 12px rgba(0,0,0,0.08)'
          : '0 1px 0 rgba(0,0,0,0.06)',
      }}
      transition={{ duration: 0.2 }}
      style={{
        backgroundColor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {showBack ? (
        <motion.div whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
          <Link
            href={backHref}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface)]"
            style={{ color: 'var(--color-text-primary)' }}
            aria-label="뒤로가기"
          >
            <ArrowLeft size={20} />
          </Link>
        </motion.div>
      ) : (
        <div className="h-10 w-10 shrink-0" />
      )}

      <div className="flex-1 text-center">
        <span
          className="text-base font-semibold leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title ?? '인구통계'}
        </span>
      </div>

      <div className="flex items-center shrink-0">
        {showSearch && (
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface)]"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="검색"
          >
            <Search size={18} />
          </Link>
        )}
        {right}
      </div>
    </motion.header>
  )
}
