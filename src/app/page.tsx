import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TotalPopulationCard } from "@/components/dashboard/TotalPopulationCard";
import { CityStatistics } from "@/components/dashboard/CityStatistics";
import { DataComparison } from "@/components/dashboard/DataComparison";
import { PopulationTrendChart } from "@/components/dashboard/PopulationTrendChart";
import { RegionalShiftChart } from "@/components/dashboard/RegionalShiftChart";
import {
  getAvailableYears,
  getAvailableMonths,
  getRegionList,
  getLatestMonth,
  getNationalSummary,
  getRegionSummary,
  getAllRegionSummaries,
  getRegionTrend,
  loadAllRecords,
} from "@/lib/data";
import { Bell, Settings } from "lucide-react";

const MONTH_NAMES_KO: Record<number, string> = {
  1: "1월", 2: "2월", 3: "3월", 4: "4월",
  5: "5월", 6: "6월", 7: "7월", 8: "8월",
  9: "9월", 10: "10월", 11: "11월", 12: "12월",
};

// Top cities for comparison (Seoul, Gyeonggi, Busan)
const COMPARISON_CITIES = ["서울특별시", "경기도", "부산광역시"];

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  // ── Bootstrap data ──────────────────────────────────────────
  loadAllRecords();
  const years = getAvailableYears();
  const currentYear =
    typeof searchParams.year === "string"
      ? parseInt(searchParams.year, 10)
      : years[0] || 2025;
  const months = getAvailableMonths(currentYear);
  const currentMonth =
    typeof searchParams.month === "string"
      ? parseInt(searchParams.month, 10)
      : getLatestMonth(currentYear);
  const currentRegion =
    typeof searchParams.region === "string" ? searchParams.region : "전국";
  const regions = getRegionList();
  const isNational = currentRegion === "전국";

  // ── Summary data ────────────────────────────────────────────
  let totalPopulation = 0;
  let yoyChange = 0;
  let yoyChangePercent = 0;
  let households = 0;
  let malePopulation = 0;
  let femalePopulation = 0;

  if (isNational) {
    const nat = getNationalSummary(currentYear, currentMonth);
    totalPopulation = nat.totalPopulation;
    yoyChange = nat.yoyChange;
    yoyChangePercent = nat.yoyChangePercent;
    households = nat.households;
    malePopulation = nat.malePopulation;
    femalePopulation = nat.femalePopulation;
  } else {
    const rs = getRegionSummary(currentRegion, currentYear, currentMonth);
    if (rs) {
      totalPopulation = rs.latestPopulation;
      yoyChange = rs.yoyChange;
      yoyChangePercent = rs.yoyChangePercent;
      households = rs.households;
      malePopulation = rs.malePopulation;
      femalePopulation = rs.femalePopulation;
    }
  }

  // ── All region summaries ─────────────────────────────────────
  const allSummaries = getAllRegionSummaries(currentYear, currentMonth);
  const peakSummary = allSummaries.reduce(
    (best, s) => (s.yoyChangePercent > best.yoyChangePercent ? s : best),
    allSummaries[0] || { regionName: "-", yoyChangePercent: 0 }
  );

  // ── City statistics list (top 8 by population) ───────────────
  const cityStats = allSummaries.slice(0, 8).map((s) => ({
    regionName: s.regionName,
    population: s.latestPopulation,
    maleRatio:
      s.malePopulation + s.femalePopulation > 0
        ? (s.malePopulation / (s.malePopulation + s.femalePopulation)) * 100
        : 50,
    femaleRatio:
      s.malePopulation + s.femalePopulation > 0
        ? (s.femalePopulation / (s.malePopulation + s.femalePopulation)) * 100
        : 50,
  }));

  // ── Data comparison cities ───────────────────────────────────
  const comparisonData = COMPARISON_CITIES.map((name) => {
    const s = allSummaries.find((x) => x.regionName.trim() === name.trim());
    return {
      name: name.replace(/특별시|광역시|도$/, ""),
      malePopulation: s?.malePopulation || 0,
      femalePopulation: s?.femalePopulation || 0,
      totalPopulation: s?.latestPopulation || 0,
    };
  }).filter((c) => c.totalPopulation > 0);
  const maxCityPop = Math.max(...comparisonData.map((c) => c.totalPopulation));

  // ── Trend chart ─────────────────────────────────────────────
  const trendRegion = isNational ? "서울특별시" : currentRegion;
  const trendSeries = [
    {
      id: isNational ? "서울" : currentRegion.replace(/특별시|광역시|도$/, ""),
      data: getRegionTrend(trendRegion).map((r) => ({
        x: `${r.year}.${r.month.toString().padStart(2, "0")}`,
        y: r.totalPopulation,
      })),
    },
    ...(isNational
      ? [
          {
            id: "경기",
            data: getRegionTrend("경기도").map((r) => ({
              x: `${r.year}.${r.month.toString().padStart(2, "0")}`,
              y: r.totalPopulation,
            })),
          },
        ]
      : []),
  ];

  // ── Regional shift chart ─────────────────────────────────────
  const shiftData = allSummaries.map((s) => ({
    region: s.regionName.replace(/\s+/g, ""),
    change: Number(s.yoyChangePercent.toFixed(2)),
    population: s.latestPopulation,
  }));

  const regionLabel = isNational
    ? "Korea"
    : currentRegion.replace(/특별시|광역시|도$/, "");

  return (
    <div className="flex w-full h-full">
      {/* ── Desktop Sidebar (hidden on mobile) ──────────────── */}
      <div className="hidden md:block">
        <Sidebar regions={regions} years={years} months={months} />
      </div>

      {/* ── Mobile Header + Drawer (hidden on desktop) ──────── */}
      <MobileHeader regions={regions} years={years} months={months} />

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="md:ml-[280px] flex-grow overflow-y-auto h-screen w-full custom-scrollbar">

        {/* ──── Desktop layout ──────────────────────────────── */}
        <div className="hidden md:block p-6 max-w-[1440px] mx-auto flex flex-col gap-6">
          <header className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-headline-md text-[24px] font-semibold text-on-surface">
                {isNational ? "전국 인구 현황" : `${currentRegion} 인구 현황`}
              </h2>
              <p className="font-body-base text-[16px] text-on-surface-variant">
                {currentYear}년 {MONTH_NAMES_KO[currentMonth]} 기준 주민등록 인구통계
              </p>
            </div>
            <div className="flex gap-4">
              <button className="glass-panel p-2 rounded-full text-on-surface-variant hover:text-primary-container transition-colors">
                <Bell size={20} />
              </button>
              <button className="glass-panel p-2 rounded-full text-on-surface-variant hover:text-primary-container transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </header>

          <SummaryCards
            totalPopulation={totalPopulation}
            yoyChange={yoyChange}
            yoyChangePercent={yoyChangePercent}
            households={households}
            malePopulation={malePopulation}
            femalePopulation={femalePopulation}
            peakRegion={peakSummary.regionName?.replace(/\s+/g, "") || "-"}
            peakGrowthPercent={peakSummary.yoyChangePercent || 0}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PopulationTrendChart
                data={trendSeries}
                title={
                  isNational
                    ? "월별 인구 추이 (서울 vs 경기)"
                    : `${currentRegion} 월별 인구 추이`
                }
              />
            </div>
            <div className="lg:col-span-1">
              <RegionalShiftChart data={shiftData} />
            </div>
          </div>
        </div>

        {/* ──── Mobile layout ───────────────────────────────── */}
        <div className="md:hidden pt-20 px-6 pb-10 flex flex-col gap-6">
          {/* Ambient background glows */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-container/10 blur-[120px] rounded-full mix-blend-screen" />
            <div className="absolute bottom-0 right-[-100px] w-[400px] h-[400px] bg-secondary-container/10 blur-[100px] rounded-full mix-blend-screen" />
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            {/* Total Population Card */}
            <TotalPopulationCard
              totalPopulation={totalPopulation}
              yoyChangePercent={yoyChangePercent}
              malePopulation={malePopulation}
              femalePopulation={femalePopulation}
              regionLabel={regionLabel}
            />

            {/* City Statistics */}
            <CityStatistics cities={cityStats} />

            {/* Trend Chart (mobile) */}
            <PopulationTrendChart
              data={trendSeries}
              title={isNational ? "Population Trend" : `${regionLabel} Trend`}
            />

            {/* Data Comparison */}
            <DataComparison
              cities={comparisonData}
              maxPopulation={maxCityPop}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
