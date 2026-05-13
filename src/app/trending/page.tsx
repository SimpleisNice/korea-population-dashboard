import type { Metadata } from 'next'
import Link from 'next/link'
import { BarChart2 } from 'lucide-react'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { AdSlot } from '@/components/ads/AdSlot'
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
        <TrendingClient data={data} latestYm={latestYm} />
        <div style={{ marginTop: 20 }}>
          <AdSlot />
        </div>
      </div>
    </MobileShell>
  )
}
