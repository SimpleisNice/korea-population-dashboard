import { Suspense } from 'react'
import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { CompareClient } from '@/components/compare/CompareClient'
import { getAllRegions, getRegionDetail, getAvailableMonths } from '@/lib/data'

export const metadata: Metadata = {
  title: '지역 비교',
  description: '두 시군구의 인구 통계를 나란히 비교해보세요.',
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

      </div>
    </MobileShell>
  )
}
