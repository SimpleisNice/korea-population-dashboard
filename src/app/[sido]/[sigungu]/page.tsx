import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { GitCompare, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/region/StatCard";
import { TrendChart } from "@/components/region/TrendChart";
import { AdSlot } from "@/components/ads/AdSlot";
import { getMockRegionDetail, getRegionBySlug } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

interface Params {
  sido: string;
  sigungu: string;
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
    title: `${sigunguName} 인구통계 2025년 4월`,
    description: `${sidoName} ${sigunguName} 인구 현황. 총인구, 세대수, 인구 추이를 확인하세요.`,
  };
}

export default async function RegionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { sido, sigungu } = await params;
  const sidoName = decodeURIComponent(sido);
  const sigunguName = decodeURIComponent(sigungu);

  const region = getRegionBySlug(sidoName, sigunguName);
  if (!region) notFound();

  const detail = getMockRegionDetail(region.code);
  if (!detail) notFound();

  const { latest, prevMonth, trend } = detail;
  const popChange = prevMonth
    ? latest.population - prevMonth.population
    : undefined;
  const hhChange = prevMonth
    ? latest.households - prevMonth.households
    : undefined;

  const compareUrl = `/compare?a=${region.code}`;

  return (
    <MobileShell>
      <Header
        title={sigunguName}
        showBack
        backHref="/"
        showSearch
        right={
          <Link
            href={compareUrl}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ color: "var(--color-accent)" }}
            aria-label="비교하기"
          >
            <GitCompare size={20} />
          </Link>
        }
      />

      <div style={{ padding: "0 16px 32px" }}>
        {/* 기준 정보 */}
        <p
          className="text-[13px]"
          style={{
            color: "var(--color-text-secondary)",
            margin: "18px 0 16px",
          }}
        >
          {sidoName} · 2025년 4월 기준
        </p>

        {/* 핵심 지표 */}
        <div className="flex gap-3" style={{ marginBottom: 12 }}>
          <StatCard
            label="총 인구"
            value={latest.population}
            change={popChange}
          />
          <StatCard
            label="세대수"
            value={latest.households}
            change={hhChange}
          />
        </div>

        <div className="flex gap-3" style={{ marginBottom: 20 }}>
          <StatCard
            label="세대당 인구"
            value={latest.householdSize}
            unit="명"
            small
          />
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
              style={{
                color: "var(--color-text-secondary)",
                margin: "0 0 8px",
              }}
            >
              성비 (남/여)
            </p>
            <p
              style={{
                fontSize: 17,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              <span style={{ color: "var(--color-accent)" }}>
                {formatNumber(latest.male)}
              </span>
              <span
                style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}
              >
                {" / "}
              </span>
              <span style={{ color: "var(--color-female)" }}>
                {formatNumber(latest.female)}
              </span>
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
          <p
            className="font-bold"
            style={{
              fontSize: 16,
              color: "var(--color-text-primary)",
              margin: "0 0 16px",
            }}
          >
            인구 추이 (최근 12개월)
          </p>
          <TrendChart data={trend} />
        </div>

        {/* 상세보기 버튼 */}
        <Link
          href={`/${sido}/${sigungu}/detail`}
          className="flex w-full items-center justify-between rounded-xl text-[15px] font-semibold transition-colors"
          style={{
            backgroundColor: "var(--color-accent-light)",
            color: "var(--color-accent)",
            marginBottom: 20,
            padding: "18px 20px",
          }}
        >
          <span>세대·연령·전입출 상세 정보</span>
          <ChevronRight size={18} />
        </Link>

        {/* 광고 */}
        <AdSlot />
      </div>
    </MobileShell>
  );
}
