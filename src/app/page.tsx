import type { Metadata } from "next";
import { MobileShell } from "@/components/layout/MobileShell";
import { RegionSearch } from "@/components/home/RegionSearch";
import { PopularRegions } from "@/components/home/PopularRegions";
import { RecentRegions } from "@/components/home/RecentRegions";
import { NationalSummary } from "@/components/home/NationalSummary";
import { FavoriteRegions } from "@/components/home/FavoriteRegions";
import { getAllRegions, getPopularRegions, getDecliningRegions, getAgingRegions } from "@/lib/data";

export const metadata: Metadata = {
  title: "부동산 인구통계 — 시군구 인구 현황",
};

function codeToRegions(codes: string[], regions: ReturnType<typeof getAllRegions>) {
  return codes
    .map((code) => regions.find((r) => r.code === code))
    .filter((r): r is NonNullable<typeof r> => r != null);
}

export default function HomePage() {
  const regions = getAllRegions();
  const growthRegions  = codeToRegions(getPopularRegions(),  regions);
  const declineRegions = codeToRegions(getDecliningRegions(), regions);
  const agingRegions   = codeToRegions(getAgingRegions(),    regions);

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
        <div style={{ marginBottom: 20 }}>
          <RegionSearch regions={regions} />
        </div>

        {/* 전국 총괄 현황 */}
        <div style={{ marginBottom: 28 }}>
          <NationalSummary />
        </div>

        {/* 인기 지역 */}
        <div style={{ marginBottom: 28 }}>
          <PopularRegions
            growthRegions={growthRegions}
            declineRegions={declineRegions}
            agingRegions={agingRegions}
          />
        </div>

        {/* 관심 지역 */}
        <FavoriteRegions />

        {/* 최근 본 지역 */}
        <RecentRegions />
      </div>
    </MobileShell>
  );
}
