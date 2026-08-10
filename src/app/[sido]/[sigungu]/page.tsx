import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { GitCompare, ChevronRight } from 'lucide-react'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/region/StatCard'
import { SexRatioCard } from '@/components/region/SexRatioCard'
import { YoYBarChart } from '@/components/region/YoYBarChart'
import { BookmarkButton } from '@/components/region/BookmarkButton'
import { ShareButton } from '@/components/region/ShareButton'
import { MonthPicker } from '@/components/ui/MonthPicker'
import { FadeIn } from '@/components/ui/FadeIn'
import { TimePeriodCompare } from '@/components/region/TimePeriodCompare'
import { getRegionDetail, getRegionBySlug, getAvailableMonths, getRegionRank, getMonthStats, getChildDistricts } from '@/lib/data'
import type { ChildDistrict } from '@/lib/data'
import { regionPath } from '@/lib/utils'
import { buildRegionNarrative } from '@/lib/region-narrative'
import type { RegionNarrative } from '@/lib/region-narrative'
import { SITE_URL } from '@/lib/site'

interface Params {
  sido: string
  sigungu: string
}

interface SearchParams {
  ym?: string
  cmp?: string
}

function formatYM(ym: string) {
  return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4))}월`
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { sido, sigungu } = await params
  const sidoName = decodeURIComponent(sido)
  const sigunguName = decodeURIComponent(sigungu)

  const region = getRegionBySlug(sidoName, sigunguName)
  const detail = region ? getRegionDetail(region.code) : null
  const pop = detail?.latest.population
  const change = detail && detail.prevMonth
    ? detail.latest.population - detail.prevMonth.population
    : undefined

  const description = pop
    ? `${sidoName} ${sigunguName} 인구 ${pop.toLocaleString('ko-KR')}명${change !== undefined ? (change >= 0 ? ` (전월 대비 +${change.toLocaleString('ko-KR')}명)` : ` (전월 대비 ${change.toLocaleString('ko-KR')}명)`) : ''}. 인구 추이·세대수·연령 구조·전입출 현황을 확인하세요.`
    : `${sidoName} ${sigunguName} 인구 현황. 총인구, 세대수, 인구 추이를 확인하세요.`

  const ogImageParams = new URLSearchParams({ name: sigunguName, sido: sidoName })
  if (pop) ogImageParams.set('pop', String(pop))
  if (change !== undefined) ogImageParams.set('change', String(change))
  const ogImageUrl = `${SITE_URL}/api/og?${ogImageParams.toString()}`
  const pageUrl = `${SITE_URL}/${encodeURIComponent(sidoName)}/${encodeURIComponent(sigunguName)}`

  return {
    title: `${sigunguName} 인구통계${pop ? ` — ${pop.toLocaleString('ko-KR')}명` : ''}`,
    description,
    keywords: [sigunguName, sidoName, '인구통계', '인구 추이', '세대수', '연령 구조', '부동산', `${sigunguName} 인구`],
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${sigunguName} 인구통계`,
      description,
      url: pageUrl,
      siteName: '인구통계',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${sigunguName} 인구통계` }],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${sigunguName} 인구통계`,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function RegionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const { sido, sigungu } = await params
  const { ym, cmp } = await searchParams
  const sidoName = decodeURIComponent(sido)
  const sigunguName = decodeURIComponent(sigungu)

  const region = getRegionBySlug(sidoName, sigunguName)
  if (!region) notFound()

  const availableMonths = getAvailableMonths()
  const latestMonth = availableMonths[availableMonths.length - 1]
  const currentMonth = ym && availableMonths.includes(ym) ? ym : latestMonth

  const detail = getRegionDetail(region.code, currentMonth, 12)
  if (!detail) notFound()

  const { latest, prevMonth, yoyMonth } = detail
  const popChange      = prevMonth ? latest.population  - prevMonth.population  : undefined
  const hhChange       = prevMonth ? latest.households  - prevMonth.households  : undefined
  const hhSizeChange   = prevMonth ? parseFloat((latest.householdSize - prevMonth.householdSize).toFixed(2)) : undefined
  const yoyPopChange   = yoyMonth  ? latest.population  - yoyMonth.population   : undefined
  const yoyHhChange    = yoyMonth  ? latest.households  - yoyMonth.households   : undefined
  const yoyHhSizeChange = yoyMonth ? parseFloat((latest.householdSize - yoyMonth.householdSize).toFixed(2)) : undefined

  const rank = getRegionRank(region.code, currentMonth)
  // 일반구는 순위·합계에서 제외되므로, 부모 시 상세가 이들에 도달하는 유일한 경로다
  const childDistricts = getChildDistricts(region, currentMonth)

  // 판정·분석은 전부 이 지역의 실제 수치에서 파생된다 (docs/principles.md B2)
  const narrative = buildRegionNarrative({
    sigunguName,
    sidoName,
    ym: currentMonth,
    latest,
    yoyMonth,
    trend: detail.trend,
    ageGroups: detail.ageGroups,
    rank,
  })

  // ── YoY 막대 차트 데이터 (올해 3개월 vs 작년 동기 3개월) ──────────────────
  const curIdx = availableMonths.indexOf(currentMonth)
  const yoyBarData = ([curIdx - 2, curIdx - 1, curIdx] as number[])
    .filter(i => i >= 0)
    .map(i => {
      const tyYm = availableMonths[i]
      const lyIdx = i - 12
      const lyYm = lyIdx >= 0 ? availableMonths[lyIdx] : null
      return {
        label: `${parseInt(tyYm.slice(4))}월`,
        thisYear: getMonthStats(region.code, tyYm)?.population ?? null,
        lastYear: lyYm ? (getMonthStats(region.code, lyYm)?.population ?? null) : null,
      }
    })
  const thisYearLabel = `${currentMonth.slice(0, 4)}년`
  const lastYearLabel = curIdx >= 12
    ? `${availableMonths[curIdx - 12].slice(0, 4)}년`
    : `${parseInt(currentMonth.slice(0, 4)) - 1}년`

  const compareUrl = cmp
    ? `/compare?region_a=${cmp}&region_b=${region.code}&ym=${currentMonth}`
    : `/compare?region_a=${region.code}&ym=${currentMonth}`

  return (
    <MobileShell>
      <Header
        title={sigunguName}
        showBack
        backHref="/"
        showSearch
        right={
          <div className="flex items-center gap-1">
            <ShareButton sigunguName={sigunguName} />
            <BookmarkButton sido={sidoName} sigungu={sigunguName} />
            <Link
              href={compareUrl}
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ color: 'var(--color-accent)' }}
              aria-label="비교하기"
            >
              <GitCompare size={20} />
            </Link>
          </div>
        }
      />

      <div id="region-content" style={{ padding: '0 16px 32px' }}>
        {/* 기준월 선택 */}
        <div style={{ margin: '16px 0' }}>
          <Suspense>
            <MonthPicker availableMonths={availableMonths} current={currentMonth} />
          </Suspense>
        </div>

        {/* 기준 정보 + 순위 */}
        <FadeIn delay={0}>
          <div style={{ marginBottom: 16 }}>
            <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}>
              {sidoName} · {formatYM(currentMonth)} 기준
            </p>
            {rank && (
              <div className="flex items-center gap-1.5">
                <span
                  className="rounded-full text-[11px] font-semibold"
                  style={{
                    backgroundColor: 'var(--color-accent-light)',
                    color: 'var(--color-accent)',
                    padding: '2px 8px',
                  }}
                >
                  {sidoName} 내 {rank.sidoRank}위
                </span>
                <span
                  className="rounded-full text-[11px] font-semibold"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-secondary)',
                    padding: '2px 8px',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  전국 {rank.nationalRank}위
                </span>
              </div>
            )}
          </div>
        </FadeIn>

        {/* 한 줄 판정 — 지표를 나열하기 전에 결론부터 */}
        {narrative.verdict && (
          <FadeIn delay={0.03}>
            <VerdictCard verdict={narrative.verdict} />
          </FadeIn>
        )}

        {/* 핵심 지표 — 총인구 + 세대수 */}
        <FadeIn delay={0.06}>
          <div className="flex gap-3" style={{ marginBottom: 12 }}>
            <StatCard label="총 인구" value={latest.population} unit="명" change={popChange} yoyChange={yoyPopChange} />
            <StatCard label="세대수"  value={latest.households}  unit="세대" change={hhChange}  yoyChange={yoyHhChange} />
          </div>
        </FadeIn>

        {/* 세대당 인구 + 성비 바 */}
        <FadeIn delay={0.12}>
          <div className="flex gap-3" style={{ marginBottom: 20 }}>
            <StatCard
              label="세대당 인구"
              value={latest.householdSize}
              unit="명"
              small
              toFixed={2}
              change={hhSizeChange}
              yoyChange={yoyHhSizeChange}
            />
            <SexRatioCard male={latest.male} female={latest.female} />
          </div>
        </FadeIn>

        {/* 지역 인사이트 */}
        <FadeIn delay={0.18}>
          <RegionInsight
            sigunguName={sigunguName}
            sidoName={sidoName}
            ym={currentMonth}
            population={latest.population}
            popChange={popChange}
            yoyPopChange={yoyPopChange}
            rank={rank}
          />
        </FadeIn>

        {/* 지역 분석 (수치 기반 고유 서술) */}
        <FadeIn delay={0.21}>
          <RegionAnalysis sigunguName={sigunguName} narrative={narrative} />
        </FadeIn>

        {/* 인구 추이 차트 (전년 동기 비교) */}
        <FadeIn delay={0.24}>
          <div
            className="rounded-xl"
            style={{
              backgroundColor: 'var(--color-bg)',
              boxShadow: 'var(--shadow-card)',
              marginBottom: 20,
              padding: '20px 20px 16px',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
              <p className="font-bold" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
                인구 추이
              </p>
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', opacity: 0.7 }}>
                전년 동기 3개월 비교
              </span>
            </div>
            <YoYBarChart data={yoyBarData} thisYearLabel={thisYearLabel} lastYearLabel={lastYearLabel} />
          </div>
        </FadeIn>

        {/* 구별 현황 (일반구가 있는 시에만 노출) */}
        {childDistricts.length > 0 && (
          <FadeIn delay={0.26}>
            <ChildDistrictList
              parentName={sigunguName}
              districts={childDistricts}
              ym={currentMonth}
            />
          </FadeIn>
        )}

        {/* 시점 비교 */}
        <FadeIn delay={0.28}>
          <Suspense>
            <TimePeriodCompare
              regionCode={region.code}
              currentMonth={currentMonth}
              availableMonths={availableMonths}
              currentStats={latest}
            />
          </Suspense>
        </FadeIn>

        {/* 상세보기 버튼 */}
        <FadeIn delay={0.32}>
          <Link
            href={`/${sido}/${sigungu}/detail?ym=${currentMonth}`}
            className="flex w-full items-center justify-between rounded-xl text-[15px] font-semibold transition-colors"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #1d4ed8 100%)',
              color: '#fff',
              marginBottom: 20,
              padding: '18px 20px',
              textDecoration: 'none',
            }}
          >
            <span>세대·연령·증감 상세 정보</span>
            <ChevronRight size={18} />
          </Link>
        </FadeIn>

      </div>
    </MobileShell>
  )
}

// ── 구별 현황 ─────────────────────────────────────────────────────────────────
// 일반구(수원시 장안구 등)는 부모 시에 이미 포함되어 있어 전국 합계·순위에서 제외된다.
// 대신 부모 시 상세에서 구 단위로 내려갈 수 있게 한다 — docs/principles.md 0-2.

function ChildDistrictList({
  parentName,
  districts,
  ym,
}: {
  parentName: string
  districts: ChildDistrict[]
  ym: string
}) {
  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: 'var(--color-bg)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 20,
        padding: '20px 20px 8px',
      }}
    >
      <div className="flex items-baseline justify-between" style={{ marginBottom: 4 }}>
        <h2 className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {parentName} 구별 현황
        </h2>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', opacity: 0.7 }}>
          {districts.length}개 구
        </span>
      </div>
      <p
        className="text-[12px] leading-relaxed"
        style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
      >
        구별 인구는 {parentName} 합계에 이미 포함되어 있어 전국 순위에는 집계하지 않습니다.
      </p>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {districts.map(({ region, population, yoyChange }) => {
          const districtName = region.sigungu.slice(parentName.length).trim()
          const color =
            yoyChange == null || yoyChange === 0 ? 'var(--color-neutral)'
              : yoyChange > 0 ? 'var(--color-positive)'
                : 'var(--color-negative)'
          return (
            <li key={region.code} style={{ borderTop: '1px solid var(--color-border)' }}>
              <Link
                href={`${regionPath(region.sido, region.sigungu)}?ym=${ym}`}
                className="flex items-center justify-between"
                style={{ padding: '12px 0', textDecoration: 'none' }}
              >
                <span
                  className="text-[14px] font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {districtName}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>
                    {population.toLocaleString('ko-KR')}명
                  </span>
                  {yoyChange != null && (
                    <span className="text-[12px] font-semibold" style={{ color, minWidth: 62, textAlign: 'right' }}>
                      {yoyChange > 0 ? '+' : ''}{yoyChange.toLocaleString('ko-KR')}
                    </span>
                  )}
                  <ChevronRight size={16} style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }} />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ── 한 줄 판정 ────────────────────────────────────────────────────────────────
// 숫자 카드를 읽기 전에 "그래서 어떤 지역인가"에 먼저 답한다 (docs/principles.md 0-1)

const VERDICT_COLOR = {
  positive: { fg: 'var(--color-positive)', bg: 'var(--color-positive-light)' },
  negative: { fg: 'var(--color-negative)', bg: 'var(--color-negative-light)' },
  neutral:  { fg: 'var(--color-text-primary)', bg: 'var(--color-surface)' },
} as const

function VerdictCard({ verdict }: { verdict: NonNullable<RegionNarrative['verdict']> }) {
  const c = VERDICT_COLOR[verdict.tone]
  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: c.bg,
        borderLeft: `3px solid ${c.fg}`,
        marginBottom: 16,
        padding: '14px 16px',
      }}
    >
      <p className="text-[15px] font-bold" style={{ color: c.fg, lineHeight: 1.4, marginBottom: 6 }}>
        {verdict.headline}
      </p>
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {verdict.detail}
      </p>
    </div>
  )
}

// ── 지역 분석 ─────────────────────────────────────────────────────────────────

function RegionAnalysis({
  sigunguName,
  narrative,
}: {
  sigunguName: string
  narrative: RegionNarrative
}) {
  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: 'var(--color-bg)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 20,
        padding: '20px',
      }}
    >
      <h2
        className="text-[15px] font-bold"
        style={{ color: 'var(--color-text-primary)', marginBottom: 10 }}
      >
        {sigunguName} 인구 분석
      </h2>
      <div className="space-y-2.5">
        {narrative.paragraphs.map((s, i) => (
          <p
            key={i}
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {s}
          </p>
        ))}
      </div>
    </div>
  )
}

// ── 지역 인사이트 (리팩터링) ────────────────────────────────────────────────────

function RegionInsight({
  sigunguName,
  sidoName,
  ym,
  population,
  popChange,
  yoyPopChange,
  rank,
}: {
  sigunguName: string
  sidoName: string
  ym: string
  population: number
  popChange: number | undefined
  yoyPopChange: number | undefined
  rank: { nationalRank: number; nationalTotal: number; sidoRank: number; sidoTotal: number } | null
}) {
  const yoyRate = yoyPopChange != null && population - yoyPopChange !== 0
    ? ((yoyPopChange / (population - yoyPopChange)) * 100)
    : null

  const pills: { label: string; color: string; bg: string }[] = []

  // 전월 변화
  if (popChange !== undefined) {
    const sign = popChange > 0 ? '+' : ''
    const color = popChange > 0 ? 'var(--color-positive)' : popChange < 0 ? 'var(--color-negative)' : 'var(--color-neutral)'
    const bg = popChange > 0 ? 'var(--color-positive-light)' : popChange < 0 ? 'var(--color-negative-light)' : 'var(--color-surface)'
    pills.push({
      label: `전월 ${sign}${Math.abs(popChange).toLocaleString('ko-KR')}명`,
      color, bg,
    })
  }

  // 전년 변화율
  if (yoyRate !== null) {
    const sign = yoyRate > 0 ? '+' : ''
    const color = yoyRate > 0 ? 'var(--color-positive)' : yoyRate < 0 ? 'var(--color-negative)' : 'var(--color-neutral)'
    const bg = yoyRate > 0 ? 'var(--color-positive-light)' : yoyRate < 0 ? 'var(--color-negative-light)' : 'var(--color-surface)'
    pills.push({ label: `전년비 ${sign}${yoyRate.toFixed(2)}%`, color, bg })
  }

  // 순위
  if (rank) {
    pills.push({
      label: `${sidoName} ${rank.sidoRank}위 · 전국 ${rank.nationalRank}위`,
      color: 'var(--color-accent)',
      bg: 'var(--color-accent-light)',
    })
  }

  if (pills.length === 0) return null

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        marginBottom: 20,
        padding: '14px 16px',
      }}
    >
      <p
        className="text-[11px] font-semibold"
        style={{ color: 'var(--color-text-secondary)', marginBottom: 10, opacity: 0.7, letterSpacing: '0.04em' }}
      >
        {ym.slice(0, 4)}년 {parseInt(ym.slice(4))}월 · {sigunguName} 통계 요약
      </p>
      <div className="flex flex-wrap gap-2">
        {pills.map((pill) => (
          <span
            key={pill.label}
            className="rounded-full text-[12px] font-semibold"
            style={{
              backgroundColor: pill.bg,
              color: pill.color,
              padding: '4px 10px',
            }}
          >
            {pill.label}
          </span>
        ))}
      </div>
    </div>
  )
}
