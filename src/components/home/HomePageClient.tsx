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
  /** 합계·순위 대상인 최상위 시군구 수. 문구에 하드코딩하지 않는다 (docs/principles.md B1) */
  sigunguCount: number
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

// ── 이번 달 인구 흐름 ─────────────────────────────────────────────────────────
// 모든 문장이 실제 수치에서 파생되어 데이터가 갱신되면 내용도 바뀐다.
// 고정 템플릿 문구를 쓰지 않는다 — docs/principles.md B2.

function formatMonth(ym: string): string {
  return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4))}월`
}

function MonthlyBriefing({
  summary,
  growthRegions,
  declineRegions,
  agingRegions,
  sigunguCount,
}: {
  summary: NationalSummaryType | null
  growthRegions: RegionWithRate[]
  declineRegions: RegionWithRate[]
  agingRegions: RegionWithRate[]
  sigunguCount: number
}) {
  if (!summary) return null

  const topGrowth = growthRegions[0]
  const topDecline = declineRegions[0]
  const topAging = agingRegions[0]

  const nationalTrend =
    summary.prevMonthChange > 0 ? '늘었습니다'
      : summary.prevMonthChange < 0 ? '줄었습니다'
        : '변동이 거의 없었습니다'

  const lines: string[] = [
    `${formatMonth(summary.month)} 기준 전국 주민등록 인구는 ` +
    `${summary.totalPopulation.toLocaleString('ko-KR')}명으로, 전월 대비 ` +
    `${Math.abs(summary.prevMonthChange).toLocaleString('ko-KR')}명 ${nationalTrend}. ` +
    `전국 ${sigunguCount}개 시군구를 같은 기준으로 집계한 값입니다.`,
  ]

  if (topGrowth) {
    lines.push(
      `최근 1년 동안 가장 크게 늘어난 곳은 ${topGrowth.region.sido} ${topGrowth.region.sigungu}로 ` +
      `${(topGrowth.rate * 100).toFixed(2)}% 증가했습니다. ` +
      `이런 지역은 신규 입주나 일자리 유입이 진행 중인 경우가 많아, 주거 수요와 배후 상권이 함께 커지는 구간으로 봅니다.`,
    )
  }

  if (topDecline) {
    lines.push(
      `반대로 ${topDecline.region.sido} ${topDecline.region.sigungu}는 ` +
      `${Math.abs(topDecline.rate * 100).toFixed(2)}% 감소해 가장 큰 폭으로 줄었습니다. ` +
      `감소가 이어지는 지역은 공실 위험과 수요 위축을 함께 살펴야 합니다.`,
    )
  }

  if (topAging) {
    lines.push(
      `연령 구조에서는 ${topAging.region.sido} ${topAging.region.sigungu}의 고령화가 가장 두드러집니다. ` +
      `60세 이상 인구가 0~19세의 ${topAging.rate.toFixed(0)}% 수준으로, ` +
      `같은 인구 규모라도 필요한 주거 형태와 업종이 달라지는 지역입니다.`,
    )
  }

  return (
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
        {formatMonth(summary.month)} 인구 흐름 요약
      </h2>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <p
            key={i}
            className="text-[12px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export function HomePageClient({
  regions,
  summary,
  growthRegions,
  declineRegions,
  agingRegions,
  sigunguCount,
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

      {/* 이번 달 인구 흐름 — 실제 수치에서 파생 */}
      <Section delay={0.26} style={{ marginTop: 24 }}>
        <MonthlyBriefing
          summary={summary}
          growthRegions={growthRegions}
          declineRegions={declineRegions}
          agingRegions={agingRegions}
          sigunguCount={sigunguCount}
        />
      </Section>

      {/* 광고 */}
      <Section delay={0.3} style={{ marginTop: 24 }}>
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? ''} format="auto" />
      </Section>

      {/* 서비스 안내 텍스트 */}
      <Section delay={0.32} style={{ marginTop: 24 }}>
        <div
          className="rounded-xl"
          style={{
            backgroundColor: 'var(--color-bg)',
            boxShadow: 'var(--shadow-card)',
            padding: '20px',
          }}
        >
          <h2
            className="text-[15px] font-bold"
            style={{ color: 'var(--color-text-primary)', marginBottom: 12 }}
          >
            인구 데이터로 보는 부동산 및 상권 분석 가이드
          </h2>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
          >
            인구 변화는 부동산 수요와 상권의 흥망을 예측하는 가장 기저에 있는 선행 지표입니다.
            본 대시보드는 행정안전부가 매월 초에 공개하는 최신 주민등록 인구통계를 기반으로,
            전국 {sigunguCount}개 최상위 시군구의 인구 추이, 세대수 변화, 그리고 연령별 인구 구조를
            한눈에 파악할 수 있도록 정제하여 제공합니다. 원천 데이터가 지닌 복잡성을 제거하고,
            실제 의사결정에 필요한 수치만을 직관적으로 시각화했습니다.
          </p>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
          >
            <strong>부동산 투자 관점에서의 활용:</strong> 인구가 지속적으로 급증하는 지역은 신규 택지 지구 개발,
            대형 기업의 입주, 또는 GTX와 같은 중대한 교통 인프라 확충의 직접적인 수혜를 받고 있을
            확률이 높습니다. 반면 인구가 급감하는 지역은 산업 기반의 약화나 주변 신도시로의 인구 유출 등
            구조적 문제를 겪고 있을 수 있습니다. 단기적인 1~3개월 증감보다는 1년 이상의 장기 추세를 통해
            해당 지역이 성장기인지, 정체기인지, 혹은 쇠퇴기인지를 판단하는 기초 자료로 활용하시기 바랍니다.
          </p>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
          >
            <strong>상권 분석과 세대 분화의 이해:</strong> 총인구가 감소하더라도 세대수가 오히려 증가하는 현상이
            전국적으로 나타나고 있습니다. 이는 1~2인 가구로의 세대 분화가 빠르게 진행되고 있음을 의미합니다.
            세대수가 늘어난다는 것은 곧 소형 주거 공간(원룸, 오피스텔 등)에 대한 수요가 유지되거나
            증가한다는 신호이며, 이들을 타깃으로 하는 편의점, 배달 중심 외식업, 1인 맞춤형 서비스 업종의
            배후 수요가 견조함을 시사합니다. 또한 연령별 인구 비중을 통해 주력 소비층이 2030인지,
            4050 가족 단위인지 파악하여 업종을 선정하는 데 도움을 얻을 수 있습니다.
          </p>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong>데이터 해석 시 주의사항:</strong> 본 서비스에서 제공하는 수치는 행정상
            <strong>등록 주소지 기준의 주민등록 인구</strong>입니다. 따라서 통신사 기지국 기반의
            실제 거주 인구나 특정 시간대의 유동 인구와는 차이가 발생할 수 있습니다. 상권 입지를
            최종적으로 검토하실 때는 본 대시보드의 데이터를 배후 거주 인구의 절대적인 규모와 성격을
            파악하는 1차 필터링 도구로 활용하시고, 카드사 매출 데이터나 유동 인구 지표를 상호 보완적으로
            함께 교차 검증하시기를 권장합니다. 상세한 집계 방식과 지표의 학술적 정의는 하단의
            데이터 방법론 문서에서 확인하실 수 있습니다.
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
