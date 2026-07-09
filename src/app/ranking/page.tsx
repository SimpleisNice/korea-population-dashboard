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
            순위는 세 가지 기준으로 다르게 읽어야 합니다. <strong>총인구</strong> 정렬은
            상권 규모와 생활 인프라의 절대적인 크기를, <strong>전월 증감</strong>은 단기적인
            유입·유출 흐름을, <strong>전년 증감률</strong>은 계절 요인을 제거한 구조적 성장세를
            보여줍니다. 규모가 작은 지역은 증감률이 크게 흔들리므로 절대 증감량과 함께 보고,
            시도 필터로 같은 권역 안에서 비교하면 지역 특성이 더 선명하게 드러납니다.
          </p>
        </div>

        <Footer />
      </div>
    </MobileShell>
  )
}
