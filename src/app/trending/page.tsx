import type { Metadata } from 'next'
import Link from 'next/link'
import { BarChart2 } from 'lucide-react'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AdSlot } from '@/components/AdSlot'
import { TrendingClient } from '@/components/trending/TrendingClient'
import { getPopulationTrends, getAvailableMonths } from '@/lib/data'

export const metadata: Metadata = {
  title: '인구 트렌딩 — 인구통계',
  description: '최근 인구 급증·급감 지역 TOP 10. 3개월, 6개월, 12개월 기준으로 인구 변화가 큰 지역을 확인하세요.',
}

export default function TrendingPage() {
  const availableMonths = getAvailableMonths()
  const latestYm = availableMonths[availableMonths.length - 1]

  const data = {
    3: getPopulationTrends(3),
    6: getPopulationTrends(6),
    12: getPopulationTrends(12),
  } as const

  return (
    <MobileShell>
      <Header
        title="인구 트렌딩"
        showSearch
        right={
          <Link
            href="/ranking"
            className="flex items-center gap-1.5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
              padding: '6px 12px',
            }}
          >
            <BarChart2 size={14} />
            순위
          </Link>
        }
      />
      <div style={{ padding: '16px 16px 32px' }}>
        {/* 페이지 설명 */}
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
        >
          최근 인구 변화가 두드러진 지역을 3개월·6개월·12개월 기간별로 분석합니다.
          인구 급증·급감 패턴을 통해 부동산 시장의 수요 변화를 미리 파악해 보세요.
        </p>

        <TrendingClient data={data} latestYm={latestYm} />

        {/* 광고 */}
        <div style={{ marginTop: 24 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? ''} format="auto" />
        </div>

        {/* 해설 */}
        <div
          className="rounded-xl"
          style={{
            backgroundColor: 'var(--color-bg)',
            boxShadow: 'var(--shadow-card)',
            padding: '20px',
            marginTop: 20,
          }}
        >
          <h2
            className="text-[14px] font-bold"
            style={{ color: 'var(--color-text-primary)', marginBottom: 8 }}
          >
            인구 트렌드 읽는 법
          </h2>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            단기(3개월) 급증은 계절적 이동이나 신도시 입주 등 일시적 요인일 수 있지만,
            장기(12개월) 추세는 지역의 구조적 변화를 반영합니다.
            인구가 꾸준히 늘어나는 지역은 교통망 확충, 기업 유치, 신규 아파트 입주 등
            복합적인 성장 요인이 작용하는 경우가 많습니다.
          </p>
        </div>

        <Footer />
      </div>
    </MobileShell>
  )
}
