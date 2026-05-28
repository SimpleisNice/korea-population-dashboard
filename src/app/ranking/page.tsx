import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { RankingClient, RankingHeader } from '@/components/ranking/RankingClient'
import { getAllRegionRankings, getAvailableMonths } from '@/lib/data'

export const metadata: Metadata = {
  title: '지역 순위 — 인구통계',
  description: '전국 시군구 인구 순위. 총인구, 전월 증감, 전년 증감률 기준으로 정렬하고 시도별로 필터링하세요.',
}

interface SearchParams { sort?: string; sido?: string }

export default async function RankingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { sort, sido } = await searchParams
  const availableMonths = getAvailableMonths()
  const latestYm = availableMonths[availableMonths.length - 1]
  const entries = getAllRegionRankings(latestYm)
  const sidos = [...new Set(entries.map(e => e.region.sido))].sort()

  return (
    <MobileShell>
      <Header title="지역 순위" showSearch />
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ marginTop: 20 }}>
          <RankingHeader ym={latestYm} />
          <RankingClient entries={entries} sidos={sidos} ym={latestYm} initialSort={sort} initialSido={sido} />
        </div>
      </div>
    </MobileShell>
  )
}
