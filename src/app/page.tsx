import type { Metadata } from "next";
import { MobileShell } from "@/components/layout/MobileShell";
import { RegionSearch } from "@/components/home/RegionSearch";
import { PopularRegions } from "@/components/home/PopularRegions";
import { RecentRegions } from "@/components/home/RecentRegions";
import { REGIONS, POPULAR_REGIONS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "부동산 인구통계 — 시군구 인구 현황",
};

export default function HomePage() {
  const popularRegions = POPULAR_REGIONS.map(
    (code) => REGIONS.find((r) => r.code === code)!,
  ).filter(Boolean);

  return (
    <MobileShell>
      <div style={{ padding: "24px 16px 32px" }}>
        {/* 로고 */}
        <div style={{ marginBottom: 28 }}>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            인구통계
          </h1>
          <p
            className="mt-1.5 text-[15px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            부동산 구매 전 꼭 확인하는 시군구 인구 현황
          </p>
        </div>

        {/* 검색창 */}
        <div style={{ marginBottom: 28 }}>
          <RegionSearch regions={REGIONS} />
        </div>

        {/* 인기 지역 */}
        <div style={{ marginBottom: 28 }}>
          <PopularRegions regions={popularRegions} />
        </div>

        {/* 최근 본 지역 */}
        <RecentRegions />
      </div>
    </MobileShell>
  );
}
