/**
 * 월간 리포트 목록 `/report`
 *
 * 목적    월별 리포트 진입점.
 * 파라미터 없음
 * 렌더링  정적
 * 데이터  getReportMonths · buildMonthlyReport(최신월 요약 카드용)
 * 광고    없음 (목록 화면이라 고유 텍스트가 얇다 — principles.md E1)
 * 색인    포함 · sitemap priority 0.7
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getReportMonths, buildMonthlyReport, ymToSlug, formatYmLabel } from '@/lib/monthly-report'

export const metadata: Metadata = {
  title: '월간 인구 리포트 — 어디가 늘고 줄었나',
  description:
    '매달 전국 시군구 인구가 어디서 늘고 어디서 줄었는지 정리합니다. 전국 증감, 증가·감소 상위 지역, 시도별 분포를 한 장으로 확인하세요.',
}

const fmt = (n: number) => n.toLocaleString('ko-KR')
const signed = (n: number) => (n >= 0 ? '+' : '') + fmt(n)

export default function ReportIndexPage() {
  const months = [...getReportMonths()].reverse()
  const latest = buildMonthlyReport(months[0])

  return (
    <MobileShell>
      <Header title="월간 인구 리포트" showSearch />

      <div style={{ padding: '16px 16px 32px' }}>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
          행정안전부가 매월 공개하는 주민등록 인구를 시군구 단위로 정리합니다.
          전국 수치는 방향만 알려주지만, 실제로 늘고 줄어드는 곳은 시군구마다 갈립니다.
        </p>

        {latest && (
          <Link
            href={`/report/${latest.slug}`}
            className="block rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%)',
              border: '1px solid rgba(37,99,235,0.12)',
              padding: '18px 16px',
              marginBottom: 16,
            }}
          >
            <p className="text-[11px] font-semibold" style={{ color: 'var(--color-accent)', marginBottom: 6 }}>
              최신 리포트 · {latest.label}
            </p>
            <p className="text-[15px] font-bold leading-snug" style={{ color: 'var(--color-text-primary)', marginBottom: 8 }}>
              {latest.headline}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
              가장 많이 늘어난 곳 {latest.gainers[0].region.sigungu} {signed(latest.gainers[0].change)}명 ·
              가장 많이 줄어든 곳 {latest.losers[0].region.sigungu} {signed(latest.losers[0].change)}명
            </p>
          </Link>
        )}

        <h2 className="text-[13px] font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: 8 }}>
          전체 리포트 {months.length}건
        </h2>
        <div className="rounded-xl" style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-card)', padding: '4px 16px' }}>
          {months.map(ym => (
            <Link
              key={ym}
              href={`/report/${ymToSlug(ym)}`}
              className="flex items-center justify-between"
              style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}
            >
              <span className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {formatYmLabel(ym)}
              </span>
              <ChevronRight size={16} style={{ color: 'var(--color-text-secondary)' }} />
            </Link>
          ))}
        </div>

        <Footer />
      </div>
    </MobileShell>
  )
}
