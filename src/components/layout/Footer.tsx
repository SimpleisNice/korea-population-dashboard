import Link from 'next/link'

export function Footer() {
  return (
    <footer
      style={{
        padding: '24px 16px 16px',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link
          href="/about"
          className="text-[11px]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          서비스 소개
        </Link>
        <Link
          href="/methodology"
          className="text-[11px]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          데이터 방법론
        </Link>
        <Link
          href="/privacy"
          className="text-[11px]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          개인정보처리방침
        </Link>
      </div>
      <p
        className="text-[10px] text-center"
        style={{ color: 'var(--color-text-secondary)', opacity: 0.5, marginTop: 8 }}
      >
        데이터 출처: 행정안전부 주민등록 인구통계 · &copy; {new Date().getFullYear()} 인구통계
      </p>
    </footer>
  )
}
