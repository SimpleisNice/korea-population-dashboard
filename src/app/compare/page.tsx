/**
 * 지역 비교 `/compare`
 *
 * 목적    두 지역을 나란히 비교.
 * 파라미터 region_a · region_b(10자리 코드) · ym(YYYYMM)
 * 렌더링  동적 (searchParams)
 * 데이터  getAllRegions · getRegionDetail · getAvailableMonths
 *         이후 갱신은 Server Action(fetchRegionDetail)
 * 광고    없음
 * 색인    **noindex** · sitemap 제외
 *
 * 검색·비교는 일반구도 대상이다(getAllRegions). 합계·순위와 달리 계층을 섞어도
 * 이중 계상이 생기지 않는다 — 두 지역을 고르는 화면이기 때문이다.
 * 빈 상태에서 고유 텍스트가 거의 없어 색인에서 뺐다.
 */
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CompareClient } from '@/components/compare/CompareClient'
import { getAllRegions, getRegionDetail, getAvailableMonths } from '@/lib/data'

export const metadata: Metadata = {
  title: '지역 비교',
  description: '두 시군구의 인구 통계를 나란히 비교해보세요.',
  // 지역을 고르기 전에는 빈 상태(본문 약 560자)인 도구 화면이라 색인하지 않는다.
  // 비교 결과는 URL 파라미터에 의존해 크롤러가 보는 것은 언제나 빈 화면이다.
  robots: { index: false, follow: true },
}

interface SearchParams {
  region_a?: string
  region_b?: string
  ym?: string
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { region_a, region_b, ym } = await searchParams

  const regions = getAllRegions()
  const availableMonths = getAvailableMonths()
  const latestMonth = availableMonths[availableMonths.length - 1]
  const currentMonth = ym && availableMonths.includes(ym) ? ym : latestMonth

  const initialA = region_a ? (regions.find(r => r.code === region_a) ?? null) : null
  const initialB = region_b ? (regions.find(r => r.code === region_b) ?? null) : null
  const initialDetailA = initialA ? getRegionDetail(initialA.code, currentMonth) : null
  const initialDetailB = initialB ? getRegionDetail(initialB.code, currentMonth) : null

  return (
    <MobileShell>
      <Header title="지역 비교" showBack backHref="/" showSearch />

      <div className="px-4 py-5 space-y-5">
        {/* 페이지 설명 */}
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          관심 지역 두 곳을 선택하여 인구수, 세대수, 증감률을 나란히 비교해 보세요.
          이사·투자 후보지를 객관적인 인구 데이터로 비교할 수 있습니다.
        </p>

        <Suspense>
          <CompareClient
            regions={regions}
            availableMonths={availableMonths}
            currentMonth={currentMonth}
            initialA={initialA}
            initialB={initialB}
            initialDetailA={initialDetailA}
            initialDetailB={initialDetailB}
          />
        </Suspense>

        <Footer />
      </div>
    </MobileShell>
  )
}
