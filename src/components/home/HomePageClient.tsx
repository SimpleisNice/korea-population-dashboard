'use client'

import { motion } from 'motion/react'
import { RegionSearch } from '@/components/home/RegionSearch'
import { NationalSummary } from '@/components/home/NationalSummary'
import { PopularRegions } from '@/components/home/PopularRegions'
import { FavoriteRegions } from '@/components/home/FavoriteRegions'
import { RecentRegions } from '@/components/home/RecentRegions'
import { AdSlot } from '@/components/AdSlot'
import { Footer } from '@/components/layout/Footer'
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

      {/* 광고 */}
      <Section delay={0.26} style={{ marginTop: 24 }}>
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? ''} format="auto" />
      </Section>

      {/* 서비스 안내 텍스트 */}
      <Section delay={0.3} style={{ marginTop: 24 }}>
        <div
          className="rounded-xl"
          style={{
            backgroundColor: 'var(--color-bg)',
            boxShadow: 'var(--shadow-card)',
            padding: '20px',
          }}
        >
          <h2
            className="text-[14px] font-bold"
            style={{ color: 'var(--color-text-primary)', marginBottom: 8 }}
          >
            인구 데이터로 보는 부동산 시장
          </h2>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}
          >
            인구 변화는 부동산 수요를 예측하는 가장 기본적인 지표입니다.
            행정안전부가 매월 공개하는 주민등록 인구통계를 기반으로,
            전국 226개 시군구의 인구 추이와 세대수 변화를 분석합니다.
          </p>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            인구 급증 지역은 신규 택지 개발, 기업 이전, 교통 인프라 확충 등의 영향을 받으며,
            인구 급감 지역은 고령화, 일자리 감소 등 구조적 변화를 반영합니다.
            지역별 인구 데이터를 통해 부동산 투자의 기초 자료로 활용해 보세요.
          </p>
        </div>
      </Section>

      {/* 푸터 */}
      <Section delay={0.34}>
        <Footer />
      </Section>
    </div>
  )
}
