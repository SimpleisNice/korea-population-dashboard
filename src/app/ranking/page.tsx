import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AdSlot } from '@/components/AdSlot'
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
        {/* 페이지 설명 */}
        <div style={{ marginTop: 16, marginBottom: 4 }}>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            행정안전부 주민등록 인구통계 기준, 전국 시군구의 인구 순위입니다.
            총인구, 전월 대비 증감, 전년 대비 증감률로 정렬하여 지역별 인구 변화를 비교해 보세요.
          </p>
        </div>

        <div style={{ marginTop: 12 }}>
          <RankingHeader ym={latestYm} />
          <RankingClient entries={entries} sidos={sidos} ym={latestYm} initialSort={sort} initialSido={sido} />
        </div>

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
            인구 순위 활용 가이드
          </h2>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            인구 순위는 부동산 시장 분석의 기초 자료입니다.
            인구가 많은 지역은 상권이 활발하고 생활 인프라가 풍부하며,
            인구 증가 추세인 지역은 향후 개발 호재와 부동산 가치 상승이 기대됩니다.
            반대로 인구 감소가 지속되는 지역은 공실 리스크와 자산 가치 하락에 유의해야 합니다.
          </p>
        </div>

        <Footer />
      </div>
    </MobileShell>
  )
}
