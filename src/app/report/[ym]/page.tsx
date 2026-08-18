/**
 * 월간 인구 리포트 `/report/[ym]`  (ym = YYYY-MM)
 *
 * 목적    그 달에 어디가 늘고 줄었는지 한 장으로.
 * 파라미터 경로 세그먼트 ym. 쿼리 없음
 * 렌더링  정적 (generateStaticParams — 전월 대비가 필요해 첫 달 제외)
 * 데이터  buildMonthlyReport(ym) — getAllRegionRankings 기반
 * 광고    있음
 * 색인    포함 · sitemap priority 0.7
 *
 * 데이터가 한 달 늘면 이 페이지도 한 장 늘어난다. 갱신이 곧 콘텐츠 생산이 되는 구조다.
 * 모든 문장은 그 달 수치에서 파생된다 (principles.md B2).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AdSlot } from '@/components/AdSlot'
import { regionPath } from '@/lib/utils'
import { SITE_URL } from '@/lib/site'
import {
  buildMonthlyReport,
  getReportMonths,
  slugToYm,
  ymToSlug,
  formatYmLabel,
  type ReportRegion,
} from '@/lib/monthly-report'

interface Params { ym: string }

export function generateStaticParams() {
  return getReportMonths().map(ym => ({ ym: ymToSlug(ym) }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { ym: slug } = await params
  const ym = slugToYm(slug)
  const report = ym ? buildMonthlyReport(ym) : null
  if (!report) return { title: '월간 인구 리포트' }

  const title = `${report.label} 인구 리포트 — 어디가 늘고 줄었나`
  const description =
    `${report.headline} 인구가 가장 많이 늘어난 곳은 ${report.gainers[0].region.sido} ` +
    `${report.gainers[0].region.sigungu}입니다. 시군구별 증감과 시도 분포를 확인하세요.`
  const url = `${SITE_URL}/report/${report.slug}`

  return {
    title,
    description,
    keywords: [report.label, '인구 리포트', '인구 증감', '시군구 인구', '월간 인구통계'],
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: '인구통계', locale: 'ko_KR', type: 'article' },
  }
}

const fmt = (n: number) => n.toLocaleString('ko-KR')
const signed = (n: number) => (n >= 0 ? '+' : '') + fmt(n)
const toneOf = (n: number) =>
  n > 0 ? 'var(--color-positive)' : n < 0 ? 'var(--color-negative)' : 'var(--color-text-secondary)'

function RegionRow({ entry, rank }: { entry: ReportRegion; rank: number }) {
  return (
    <Link
      href={regionPath(entry.region.sido, entry.region.sigungu)}
      className="flex items-center gap-3"
      style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}
    >
      <span
        className="text-[12px] font-bold shrink-0"
        style={{ color: 'var(--color-text-secondary)', width: 16 }}
      >
        {rank}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[14px] font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {entry.region.sigungu}
        </span>
        <span className="block text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
          {entry.region.sido} · {fmt(entry.population)}명
        </span>
      </span>
      <span className="text-right shrink-0">
        <span className="block text-[14px] font-bold" style={{ color: toneOf(entry.change) }}>
          {signed(entry.change)}
        </span>
        <span className="block text-[11px]" style={{ color: toneOf(entry.change) }}>
          {entry.rate >= 0 ? '+' : ''}{entry.rate.toFixed(2)}%
        </span>
      </span>
    </Link>
  )
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl"
      style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-card)', padding: '16px', marginBottom: 12 }}
    >
      <h2 className="flex items-center gap-1.5 text-[14px] font-bold" style={{ color: 'var(--color-text-primary)', marginBottom: 4 }}>
        {icon}{title}
      </h2>
      {children}
    </section>
  )
}

export default async function ReportPage({ params }: { params: Promise<Params> }) {
  const { ym: slug } = await params
  const ym = slugToYm(slug)
  const report = ym ? buildMonthlyReport(ym) : null
  if (!report) notFound()

  const months = getReportMonths()
  const idx = months.indexOf(report.ym)
  const prev = idx > 0 ? months[idx - 1] : null
  const next = idx < months.length - 1 ? months[idx + 1] : null

  return (
    <MobileShell>
      <Header title={`${report.label} 리포트`} showBack backHref="/report" showSearch />

      <article style={{ padding: '16px 16px 32px' }}>
        {/* 한 줄 요약 */}
        <div
          className="rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%)',
            border: '1px solid rgba(37,99,235,0.12)',
            padding: '18px 16px',
            marginBottom: 12,
          }}
        >
          <p className="text-[11px] font-semibold" style={{ color: 'var(--color-accent)', marginBottom: 6 }}>
            {report.label} · 전월 대비
          </p>
          <p className="text-[16px] font-bold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
            {report.headline}
          </p>
        </div>

        {/* 전국 수치 */}
        <div className="flex gap-2" style={{ marginBottom: 12 }}>
          {[
            { label: '전국 인구', value: `${fmt(report.national.population)}명`, color: 'var(--color-text-primary)' },
            { label: '전월 대비', value: `${signed(report.national.change)}명`, color: toneOf(report.national.change) },
            { label: '증가 / 감소', value: `${report.national.gainerCount} / ${report.national.loserCount}곳`, color: 'var(--color-text-primary)' },
          ].map(item => (
            <div key={item.label} className="flex-1 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', padding: '12px 10px' }}>
              <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>{item.label}</p>
              <p className="text-[14px] font-bold" style={{ color: item.color, lineHeight: 1.2 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* 서술 */}
        <div
          className="rounded-xl"
          style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-card)', padding: '16px', marginBottom: 12 }}
        >
          {report.paragraphs.map((text, i) => (
            <p
              key={i}
              className="text-[13px] leading-relaxed"
              style={{ color: 'var(--color-text-secondary)', marginBottom: i === report.paragraphs.length - 1 ? 0 : 10 }}
            >
              {text}
            </p>
          ))}
        </div>

        <Section title="인구가 늘어난 곳" icon={<TrendingUp size={15} style={{ color: 'var(--color-positive)' }} />}>
          <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>전월 대비 증가 인원 기준</p>
          {report.gainers.map((e, i) => <RegionRow key={e.region.code} entry={e} rank={i + 1} />)}
        </Section>

        <Section title="인구가 줄어든 곳" icon={<TrendingDown size={15} style={{ color: 'var(--color-negative)' }} />}>
          <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>전월 대비 감소 인원 기준</p>
          {report.losers.map((e, i) => <RegionRow key={e.region.code} entry={e} rank={i + 1} />)}
        </Section>

        <Section title="증가율이 높은 곳">
          <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            비율 기준. 인구가 적은 지역일수록 크게 흔들립니다
          </p>
          {report.fastestGrowth.map((e, i) => <RegionRow key={e.region.code} entry={e} rank={i + 1} />)}
        </Section>

        <Section title="시도별 증감">
          <div style={{ marginTop: 8 }}>
            {report.sidos.map(s => (
              <div
                key={s.sido}
                className="flex items-center justify-between"
                style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}
              >
                <span className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>{s.sido}</span>
                <span className="flex items-baseline gap-2">
                  <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                    {s.gainerCount}/{s.regionCount}곳 증가
                  </span>
                  <span className="text-[13px] font-bold" style={{ color: toneOf(s.change), minWidth: 62, textAlign: 'right' }}>
                    {signed(s.change)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Section>

        <div style={{ margin: '16px 0' }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? ''} format="auto" />
        </div>

        {/* 이전·다음 달 */}
        <nav className="flex gap-2" style={{ marginBottom: 16 }}>
          {prev ? (
            <Link
              href={`/report/${ymToSlug(prev)}`}
              className="flex flex-1 items-center gap-1.5 rounded-xl"
              style={{ backgroundColor: 'var(--color-surface)', padding: '12px 14px', color: 'var(--color-text-primary)' }}
            >
              <ArrowLeft size={14} />
              <span className="text-[13px] font-medium">{formatYmLabel(prev)}</span>
            </Link>
          ) : <span className="flex-1" />}
          {next ? (
            <Link
              href={`/report/${ymToSlug(next)}`}
              className="flex flex-1 items-center justify-end gap-1.5 rounded-xl"
              style={{ backgroundColor: 'var(--color-surface)', padding: '12px 14px', color: 'var(--color-text-primary)' }}
            >
              <span className="text-[13px] font-medium">{formatYmLabel(next)}</span>
              <ArrowRight size={14} />
            </Link>
          ) : <span className="flex-1" />}
        </nav>

        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>
          행정안전부 주민등록 인구통계 기준입니다. 등록 주소지 기준이라 실제 거주 인구와 다를 수 있고,
          증감에는 출생·사망과 전입·전출이 함께 반영되어 있습니다.{' '}
          <Link href="/methodology" style={{ color: 'var(--color-accent)' }}>집계 방식 보기</Link>
        </p>

        <Footer />
      </article>
    </MobileShell>
  )
}
