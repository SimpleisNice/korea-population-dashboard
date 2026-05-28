'use client'

import { motion } from 'motion/react'
import { RegionSearch } from '@/components/home/RegionSearch'
import { NationalSummary } from '@/components/home/NationalSummary'
import { PopularRegions } from '@/components/home/PopularRegions'
import { FavoriteRegions } from '@/components/home/FavoriteRegions'
import { RecentRegions } from '@/components/home/RecentRegions'
import type { Region, NationalSummary as NationalSummaryType } from '@/lib/types'

interface RegionWithRate {
  region: Region
  rate: number
}

interface Props {
  regions: Region[]
  summary: NationalSummaryType | null
  growthRegions:  RegionWithRate[]
  declineRegions: RegionWithRate[]
  agingRegions:   RegionWithRate[]
}

const APPLE_EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

function Section({
  children,
  delay,
  style,
}: {
  children: React.ReactNode
  delay: number
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: APPLE_EASE, delay }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export function HomePageClient({
  regions,
  summary,
  growthRegions,
  declineRegions,
  agingRegions,
}: Props) {
  return (
    <div style={{ padding: '24px 16px 32px' }}>
      {/* 로고 */}
      <Section delay={0} style={{ marginBottom: 28 }}>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          인구통계
        </h1>
        <p
          className="mt-1.5 text-[15px]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          부동산 구매 전 꼭 확인하는 시군구 인구 현황
        </p>
      </Section>

      {/* 검색창 */}
      <Section delay={0.06} style={{ marginBottom: 20 }}>
        <RegionSearch regions={regions} />
      </Section>

      {/* 전국 총괄 현황 */}
      {summary && (
        <Section delay={0.1} style={{ marginBottom: 28 }}>
          <NationalSummary summary={summary} />
        </Section>
      )}

      {/* 인기 지역 */}
      <Section delay={0.14} style={{ marginBottom: 28 }}>
        <PopularRegions
          growthRegions={growthRegions}
          declineRegions={declineRegions}
          agingRegions={agingRegions}
        />
      </Section>

      {/* 관심 지역 */}
      <Section delay={0.18}>
        <FavoriteRegions />
      </Section>

      {/* 최근 본 지역 */}
      <Section delay={0.22}>
        <RecentRegions />
      </Section>
    </div>
  )
}
