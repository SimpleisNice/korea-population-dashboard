import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { HomePageClient } from '@/components/home/HomePageClient'
import {
  getAllRegions,
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
      />
    </MobileShell>
  )
}
