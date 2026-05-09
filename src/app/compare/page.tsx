import { Suspense } from 'react'
import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { CompareClient } from '@/components/compare/CompareClient'
import { AdSlot } from '@/components/ads/AdSlot'
import { getAllRegions, getRegionDetail } from '@/lib/data'

export const metadata: Metadata = {
  title: '지역 비교',
  description: '두 시군구의 인구 통계를 나란히 비교해보세요.',
}

interface SearchParams {
  a?: string
  b?: string
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { a, b } = await searchParams

  const regions = getAllRegions()
  const initialA = a ? (regions.find(r => r.code === a) ?? null) : null
  const initialB = b ? (regions.find(r => r.code === b) ?? null) : null
  const initialDetailA = initialA ? getRegionDetail(initialA.code) : null
  const initialDetailB = initialB ? getRegionDetail(initialB.code) : null

  return (
    <MobileShell>
      <Header title="지역 비교" showBack backHref="/" showSearch />

      <div className="px-4 py-5 space-y-5">
        <Suspense>
          <CompareClient
            regions={regions}
            initialA={initialA}
            initialB={initialB}
            initialDetailA={initialDetailA}
            initialDetailB={initialDetailB}
          />
        </Suspense>

        <AdSlot />
      </div>
    </MobileShell>
  )
}
