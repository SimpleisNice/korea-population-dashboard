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
import { formatNumber } from "@/lib/utils";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { sido, sigungu } = await params;
  const sidoName = decodeURIComponent(sido);
  const sigunguName = decodeURIComponent(sigungu);
  return {
    title: `${sigunguName} 인구통계`,
    description: `${sidoName} ${sigunguName} 인구 현황. 총인구, 세대수, 인구 추이를 확인하세요.`,
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
  const { ym, range } = await searchParams;
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
  const compareUrl = `/compare?region_a=${region.code}&ym=${currentMonth}`;

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
          <TrendChart data={trend} />
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
