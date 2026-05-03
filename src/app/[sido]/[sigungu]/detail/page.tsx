import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { DetailTabs } from '@/components/detail/DetailTabs'
import { AdSlot } from '@/components/ads/AdSlot'
import { getMockRegionDetail, getRegionBySlug } from '@/lib/mock-data'

interface Params {
  sido: string
  sigungu: string
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { sigungu } = await params
  const name = decodeURIComponent(sigungu)
  return { title: `${name} 상세 통계` }
}

export default async function DetailPage({ params }: { params: Promise<Params> }) {
  const { sido, sigungu } = await params
  const sidoName = decodeURIComponent(sido)
  const sigunguName = decodeURIComponent(sigungu)

  const region = getRegionBySlug(sidoName, sigunguName)
  if (!region) notFound()

  const detail = getMockRegionDetail(region.code)
  if (!detail) notFound()

  return (
    <MobileShell>
      <Header
        title={`${sigunguName} 상세`}
        showBack
        backHref={`/${sido}/${sigungu}`}
        showSearch
      />

      <div className="px-4 py-5 space-y-5">
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {sidoName} · 2025년 4월 기준
        </p>

        <DetailTabs detail={detail} />

        <AdSlot />
      </div>
    </MobileShell>
  )
}
