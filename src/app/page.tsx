/**
 * 홈 `/`
 *
 * 목적    진입점. 지역 검색과 전국 현황.
 * 파라미터 없음
 * 렌더링  정적 (Static)
 * 데이터  getAllRegions · getNationalSummary · getTopLevelRegions
 *         getPopularRegions · getDecliningRegions · getAgingRegions
 * 광고    있음 (HomePageClient 하단 AdSlot)
 * 색인    포함 · sitemap priority 1.0
 *
 * 지역 배열 전체를 클라이언트로 내린다(검색용). 코드·시도·시군구·level 만 담기므로
 * 허용 범위다 — 월별 통계는 내리지 않는다 (principles.md D2).
 */
import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { HomePageClient } from '@/components/home/HomePageClient'
import {
  getAllRegions,
  getTopLevelRegions,
  getPopularRegions,
  getDecliningRegions,
  getAgingRegions,
  getNationalSummary,
} from '@/lib/data'

export const metadata: Metadata = {
  title: '부동산 인구통계 — 시군구 인구 현황',
}

function codeToRegions(
  entries: { code: string; rate: number }[],
  regions: ReturnType<typeof getAllRegions>,
) {
  return entries
    .map(({ code, rate }) => {
      const region = regions.find(r => r.code === code)
      return region ? { region, rate } : null
    })
    .filter((r): r is NonNullable<typeof r> => r != null)
}

export default function HomePage() {
  const regions       = getAllRegions()
  const summary       = getNationalSummary()
  const growthRegions  = codeToRegions(getPopularRegions(),   regions)
  const declineRegions = codeToRegions(getDecliningRegions(), regions)
  const agingRegions   = codeToRegions(getAgingRegions(),     regions)

  return (
    <MobileShell>
      <HomePageClient
        regions={regions}
        summary={summary}
        growthRegions={growthRegions}
        declineRegions={declineRegions}
        agingRegions={agingRegions}
        sigunguCount={getTopLevelRegions().length}
      />
    </MobileShell>
  )
}
