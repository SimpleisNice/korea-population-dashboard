import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { GitCompare, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/region/StatCard";
import { TrendChart } from "@/components/region/TrendChart";
import { BookmarkButton } from "@/components/region/BookmarkButton";
import { ShareButton } from "@/components/region/ShareButton";
import { AdSlot } from "@/components/ads/AdSlot";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { RangeToggle } from "@/components/ui/RangeToggle";
import { TimePeriodCompare } from "@/components/region/TimePeriodCompare";
import { getRegionDetail, getRegionBySlug, getAvailableMonths, getRegionRank } from "@/lib/data";
import { formatNumber, buildForecast } from "@/lib/utils";

interface Params {
  sido: string;
  sigungu: string;
}

interface SearchParams {
  ym?: string;
  cmp?: string;
  range?: string;
}

function formatYM(ym: string) {
  return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4))}월`;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://korea-population-dashboard.vercel.app'

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { sido, sigungu } = await params;
  const sidoName = decodeURIComponent(sido);
  const sigunguName = decodeURIComponent(sigungu);

  const region = getRegionBySlug(sidoName, sigunguName);
  const detail = region ? getRegionDetail(region.code) : null;
  const pop = detail?.latest.population;
  const change = detail && detail.prevMonth ? detail.latest.population - detail.prevMonth.population : undefined;

  const description = pop
    ? `${sidoName} ${sigunguName} 인구 ${pop.toLocaleString('ko-KR')}명${change !== undefined ? (change >= 0 ? ` (전월 대비 +${change.toLocaleString('ko-KR')}명)` : ` (전월 대비 ${change.toLocaleString('ko-KR')}명)`) : ''}. 인구 추이·세대수·연령 구조·전입출 현황을 확인하세요.`
    : `${sidoName} ${sigunguName} 인구 현황. 총인구, 세대수, 인구 추이를 확인하세요.`;

  const ogImageParams = new URLSearchParams({ name: sigunguName, sido: sidoName });
  if (pop) ogImageParams.set('pop', String(pop));
  if (change !== undefined) ogImageParams.set('change', String(change));
  const ogImageUrl = `${SITE_URL}/api/og?${ogImageParams.toString()}`;
  const pageUrl = `${SITE_URL}/${encodeURIComponent(sidoName)}/${encodeURIComponent(sigunguName)}`;

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
  };
}

export default async function RegionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { sido, sigungu } = await params;
  const { ym, cmp, range } = await searchParams;
  const rangeMonths = range === 'all' ? 0 : range === '6' ? 6 : 12
  const currentRange = range === 'all' ? 'all' : range === '6' ? '6' : '12'
  const rangeLabel = currentRange === 'all' ? '전체 기간' : `최근 ${currentRange}개월`
  const sidoName = decodeURIComponent(sido);
  const sigunguName = decodeURIComponent(sigungu);

  const region = getRegionBySlug(sidoName, sigunguName);
  if (!region) notFound();

  const availableMonths = getAvailableMonths();
  const latestMonth = availableMonths[availableMonths.length - 1];
  const currentMonth = ym && availableMonths.includes(ym) ? ym : latestMonth;

  const detail = getRegionDetail(region.code, currentMonth, rangeMonths);
  if (!detail) notFound();

  const { latest, prevMonth, yoyMonth, trend } = detail;
  const popChange = prevMonth ? latest.population - prevMonth.population : undefined;
  const hhChange = prevMonth ? latest.households - prevMonth.households : undefined;
  const yoyPopChange = yoyMonth ? latest.population - yoyMonth.population : undefined;
  const yoyHhChange = yoyMonth ? latest.households - yoyMonth.households : undefined;

  const rank = getRegionRank(region.code, currentMonth);
  const forecast = buildForecast(trend, 6);
  const compareUrl = cmp
    ? `/compare?region_a=${cmp}&region_b=${region.code}&ym=${currentMonth}`
    : `/compare?region_a=${region.code}&ym=${currentMonth}`;

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
              style={{ color: "var(--color-accent)" }}
              aria-label="비교하기"
            >
              <GitCompare size={20} />
            </Link>
          </div>
        }
      />

      <div id="region-content" style={{ padding: "0 16px 32px" }}>
        {/* 기준월 선택 */}
        <div style={{ margin: "16px 0" }}>
          <Suspense>
            <MonthPicker availableMonths={availableMonths} current={currentMonth} />
          </Suspense>
        </div>

        {/* 기준 정보 */}
        <p
          className="text-[13px]"
          style={{ color: "var(--color-text-secondary)", margin: "0 0 4px" }}
        >
          {sidoName} · {formatYM(currentMonth)} 기준
        </p>
        {rank && (
          <p
            className="text-[12px]"
            style={{ color: "var(--color-text-secondary)", margin: "0 0 16px", opacity: 0.7 }}
          >
            {sidoName} 내 {rank.sidoRank}위 · 전국 {rank.nationalRank}위
          </p>
        )}

        {/* 핵심 지표 */}
        <div className="flex gap-3" style={{ marginBottom: 12 }}>
          <StatCard label="총 인구" value={latest.population} change={popChange} yoyChange={yoyPopChange} />
          <StatCard label="세대수" value={latest.households} change={hhChange} yoyChange={yoyHhChange} />
        </div>

        <div className="flex gap-3" style={{ marginBottom: 20 }}>
          <StatCard label="세대당 인구" value={latest.householdSize} unit="명" small />
          <div
            className="flex-1 rounded-xl"
            style={{
              backgroundColor: "var(--color-bg)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              padding: "18px 20px",
            }}
          >
            <p
              className="text-[13px] font-medium"
              style={{ color: "var(--color-text-secondary)", margin: "0 0 8px" }}
            >
              성비 (남/여)
            </p>
            <p style={{ fontSize: 17, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              <span style={{ color: "var(--color-accent)" }}>{formatNumber(latest.male)}</span>
              <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>{" / "}</span>
              <span style={{ color: "var(--color-female)" }}>{formatNumber(latest.female)}</span>
            </p>
          </div>
        </div>

        {/* 지역 인사이트 요약 */}
        <RegionInsight
          sigunguName={sigunguName}
          sidoName={sidoName}
          ym={currentMonth}
          population={latest.population}
          popChange={popChange}
          yoyPopChange={yoyPopChange}
          rank={rank}
        />

        {/* 인구 추이 차트 */}
        <div
          className="rounded-xl"
          style={{
            backgroundColor: "var(--color-bg)",
            boxShadow: "var(--shadow-card)",
            marginBottom: 20,
            padding: "20px 20px 16px",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <p className="font-bold" style={{ fontSize: 15, color: "var(--color-text-primary)" }}>
              인구 추이 ({rangeLabel})
            </p>
            <Suspense>
              <RangeToggle current={currentRange} />
            </Suspense>
          </div>
          <TrendChart data={trend} forecast={forecast} />
        </div>

        {/* 시점 비교 */}
        <Suspense>
          <TimePeriodCompare
            regionCode={region.code}
            currentMonth={currentMonth}
            availableMonths={availableMonths}
            currentStats={latest}
          />
        </Suspense>

        {/* 상세보기 버튼 */}
        <Link
          href={`/${sido}/${sigungu}/detail?ym=${currentMonth}`}
          className="flex w-full items-center justify-between rounded-xl text-[15px] font-semibold transition-colors"
          style={{
            backgroundColor: "var(--color-accent-light)",
            color: "var(--color-accent)",
            marginBottom: 20,
            padding: "18px 20px",
          }}
        >
          <span>세대·연령·증감 상세 정보</span>
          <ChevronRight size={18} />
        </Link>

        {/* 광고 */}
        <AdSlot />
      </div>
    </MobileShell>
  );
}

function RegionInsight({
  sigunguName,
  sidoName,
  ym,
  population,
  popChange,
  yoyPopChange,
  rank,
}: {
  sigunguName: string;
  sidoName: string;
  ym: string;
  population: number;
  popChange: number | undefined;
  yoyPopChange: number | undefined;
  rank: { nationalRank: number; nationalTotal: number; sidoRank: number; sidoTotal: number } | null;
}) {
  const ymLabel = `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4))}월`;
  const popStr = population.toLocaleString("ko-KR");

  const trendDesc = (() => {
    if (yoyPopChange == null) return null;
    const rate = ((yoyPopChange / (population - yoyPopChange)) * 100).toFixed(2);
    const dir = yoyPopChange > 0 ? "증가" : yoyPopChange < 0 ? "감소" : "유지";
    const sign = yoyPopChange > 0 ? "+" : "";
    return `전년 동월 대비 ${sign}${yoyPopChange.toLocaleString("ko-KR")}명(${sign}${rate}%) ${dir}하여 ${yoyPopChange > 0 ? "인구 유입" : yoyPopChange < 0 ? "인구 유출" : "현상 유지"} 지역입니다.`;
  })();

  const momDesc = (() => {
    if (popChange == null) return null;
    const sign = popChange > 0 ? "+" : "";
    return `전월 대비 ${sign}${popChange.toLocaleString("ko-KR")}명`;
  })();

  const rankDesc = rank
    ? `${sidoName} 내 ${rank.sidoRank}위(${rank.sidoTotal}개 시군구 중), 전국 ${rank.nationalRank}위(${rank.nationalTotal}개 시군구 중)입니다.`
    : null;

  const sentences = [
    `${sigunguName}(${sidoName})는 ${ymLabel} 기준 총인구 ${popStr}명${momDesc ? `(${momDesc})` : ""}입니다.`,
    trendDesc,
    rankDesc,
  ].filter(Boolean) as string[];

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: "var(--color-surface)",
        borderTop: "3px solid var(--color-accent)",
        marginBottom: 20,
        padding: "16px 20px",
      }}
    >
      <p
        className="text-[12px] font-semibold"
        style={{ color: "var(--color-accent)", marginBottom: 8, letterSpacing: "0.05em" }}
      >
        통계 요약
      </p>
      <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {sentences.join(" ")}
      </p>
    </div>
  );
}
