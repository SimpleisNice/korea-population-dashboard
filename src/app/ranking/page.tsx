/**
 * 지역 순위 `/ranking`
 *
 * 목적    현행 최상위 시군구를 지표별로 정렬.
 * 파라미터 sort(population|popChange|popChangeRate|households, 기본 population)
 *         sido(시도명)
 * 렌더링  동적 (searchParams)
 * 데이터  getAllRegionRankings(최신월) · getAvailableMonths
 * 광고    있음 (리스트 하단)
 * 색인    포함 · sitemap priority 0.9
 *
 * 기준월은 항상 최신월 고정 — MonthPicker 가 없다.
 * 순위 대상은 현행 최상위 시군구뿐이다. 일반구는 부모 시에 이미 포함되어 있고,
 * 폐지 지역은 최신월 데이터가 없어 자동 제외된다 (principles.md A1·A4-1).
 */
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
            className="text-[15px] font-bold"
            style={{ color: 'var(--color-text-primary)', marginBottom: 12 }}
          >
            지역별 인구 순위 활용 및 해석 가이드
          </h2>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
          >
            전국 시군구 단위의 인구 순위표는 단순한 등수를 넘어, 지역 간의 상대적 위상과 
            자본/수요의 이동 흐름을 가장 명확하게 보여주는 지표입니다. 본 순위표는 크게 세 가지 
            기준으로 정렬하여 분석할 수 있으며, 각 기준은 부동산 및 상권 분석 시 서로 다른 통찰을 제공합니다.
          </p>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
          >
            <strong>총인구 규모의 의미:</strong> 총인구 정렬은 해당 지역의 절대적인 상권 규모, 
            배후 소비력, 그리고 생활 인프라의 크기를 가늠하는 척도입니다. 통상적으로 인구 50만 명 
            이상은 대도시 특례 수준의 인프라(대형 병원, 백화점, 독자적 학군 등)를 갖추며, 
            상권이 자족적인 생태계를 형성합니다. 따라서 프랜차이즈 진입이나 대형 상업 시설 투자를 
            검토할 때는 총인구가 높은 지역부터 우선순위를 두는 것이 일반적입니다.
          </p>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
          >
            <strong>단기 및 장기 증감 흐름:</strong> <strong>전월 증감</strong>은 신규 아파트 단지의 입주, 
            대학가의 학기 시작 등 단기적인 유입·유출 이벤트나 계절적 요인을 포착하기 좋습니다. 
            반면 <strong>전년 대비 증감률(YoY)</strong>은 계절적 요인을 배제한 구조적이고 
            장기적인 성장세를 보여줍니다. 만약 특정 지역이 전년 대비 증감률 최상위권을 수개월째 
            유지하고 있다면, 이는 일시적인 현상이 아니라 교통망 신설이나 대규모 산업 단지 조성 등 
            강력한 펀더멘털의 변화가 진행 중임을 암시합니다.
          </p>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong>분석 시 주의할 점:</strong> 총인구 규모가 작은 군 단위 지역은 단 1,000명만 증가해도 
            증감률(%)이 비정상적으로 크게 튀어 오를 수 있습니다. 따라서 순위를 읽을 때는 증감률과 
            동시에 절대 증감량(명)을 반드시 함께 교차 확인해야 합니다. 또한 전국 단위의 줄세우기보다는, 
            상단의 <strong>시도 필터</strong>를 사용하여 동일한 생활권이나 경제 권역 내에서 비교할 때 
            해당 지역의 진정한 부동산 및 상업적 경쟁력이 훨씬 선명하게 드러납니다.
          </p>
        </div>

        <Footer />
      </div>
    </MobileShell>
  )
}
