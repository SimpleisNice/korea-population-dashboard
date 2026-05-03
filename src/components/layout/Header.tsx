'use client'

import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  backHref?: string
  showSearch?: boolean
  right?: React.ReactNode
}

export function Header({ title, showBack, backHref = '/', showSearch, right }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center gap-1 px-2"
      style={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {showBack ? (
        <Link
          href={backHref}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface)]"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} />
        </Link>
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
    </header>
  )
}
