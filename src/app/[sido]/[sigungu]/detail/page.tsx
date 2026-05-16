import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { DetailTabs } from '@/components/detail/DetailTabs'
import { AdSlot } from '@/components/ads/AdSlot'
import { MonthPicker } from '@/components/ui/MonthPicker'
import { getRegionDetail, getRegionBySlug, getAvailableMonths } from '@/lib/data'

interface Params {
  sido: string
  sigungu: string
}

interface SearchParams {
  ym?: string
}

function formatYM(ym: string) {
  return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4))}월`
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { sigungu } = await params
  const name = decodeURIComponent(sigungu)
  return { title: `${name} 상세 통계` }
}

export default async function DetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const { sido, sigungu } = await params
  const { ym } = await searchParams
  const sidoName = decodeURIComponent(sido)
  const sigunguName = decodeURIComponent(sigungu)

  const region = getRegionBySlug(sidoName, sigunguName)
  if (!region) notFound()

  const availableMonths = getAvailableMonths()
  const latestMonth = availableMonths[availableMonths.length - 1]
  const currentMonth = ym && availableMonths.includes(ym) ? ym : latestMonth

  const detail = getRegionDetail(region.code, currentMonth, 0)
  if (!detail) notFound()

  return (
    <MobileShell>
      <Header
        title={`${sigunguName} 상세`}
        showBack
        backHref={`/${sido}/${sigungu}?ym=${currentMonth}`}
        showSearch
      />

      <div style={{ padding: '0 16px 32px' }}>
        {/* 기준월 선택 */}
        <div style={{ margin: '16px 0' }}>
          <Suspense>
            <MonthPicker availableMonths={availableMonths} current={currentMonth} />
          </Suspense>
        </div>

        <p
          className="text-[13px]"
          style={{ color: 'var(--color-text-secondary)', margin: '0 0 16px' }}
        >
          {sidoName} · {formatYM(currentMonth)} 기준
        </p>

        <DetailTabs
          detail={detail}
          regionCode={region.code}
          currentMonth={currentMonth}
          availableMonths={availableMonths}
        />

        <div style={{ marginTop: 20 }}>
          <AdSlot />
        </div>
      </div>
    </MobileShell>
  )
}
