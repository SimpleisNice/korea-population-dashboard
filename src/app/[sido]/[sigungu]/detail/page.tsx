/**
 * 지역 상세 `/[sido]/[sigungu]/detail`
 *
 * 목적    추이·세대·연령·증감 심층.
 * 파라미터 ym(기본 최신월). 기간 토글(6/12/전체)은 클라이언트 상태 → P2-1
 * 렌더링  동적
 * 데이터  getRegionBySlug · getRegionDetail(range=0 → 전체 기간)
 *         연령 탭 시점 변경은 Server Action(fetchAgeGroups)
 * 광고    없음
 * 색인    포함 · sitemap priority 0.6
 *
 * range=0 으로 전체 기간을 넘기고 축소는 DetailTabs 안에서 한다.
 * 탭 4개: 인구추이 / 세대 / 연령 / 증감.
 * 구 "전입출" 탭은 증감 탭에 통합됐다 — 같은 데이터로 같은 차트를 두 번 그렸고,
 * 우리는 전입·전출 데이터를 갖고 있지 않다 (principles.md A3).
 */
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { DetailTabs } from '@/components/detail/DetailTabs'
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

      </div>
    </MobileShell>
  )
}
