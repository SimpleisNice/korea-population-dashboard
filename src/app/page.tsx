import { Sidebar } from "@/components/layout/Sidebar";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
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
  1: '1월', 2: '2월', 3: '3월', 4: '4월',
  5: '5월', 6: '6월', 7: '7월', 8: '8월',
  9: '9월', 10: '10월', 11: '11월', 12: '12월',
};

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  // Load data
  loadAllRecords();
  const years = getAvailableYears();
  const currentYear = typeof searchParams.year === 'string'
    ? parseInt(searchParams.year, 10)
    : years[0] || 2025;
  const months = getAvailableMonths(currentYear);
  const currentMonth = typeof searchParams.month === 'string'
    ? parseInt(searchParams.month, 10)
    : getLatestMonth(currentYear);
  const currentRegion = typeof searchParams.region === 'string'
    ? searchParams.region
    : "전국";
  const regions = getRegionList();

  // ── Summary ────────────────────────────────────────────────
  const isNational = currentRegion === "전국";

  let totalPopulation = 0;
  let yoyChange = 0;
  let yoyChangePercent = 0;
  let households = 0;
  let malePopulation = 0;
  let femalePopulation = 0;

  if (isNational) {
    const national = getNationalSummary(currentYear, currentMonth);
    totalPopulation = national.totalPopulation;
    yoyChange = national.yoyChange;
    yoyChangePercent = national.yoyChangePercent;
    households = national.households;
    malePopulation = national.malePopulation;
    femalePopulation = national.femalePopulation;
  } else {
    const regionSummary = getRegionSummary(currentRegion, currentYear, currentMonth);
    if (regionSummary) {
      totalPopulation = regionSummary.latestPopulation;
      yoyChange = regionSummary.yoyChange;
      yoyChangePercent = regionSummary.yoyChangePercent;
      households = regionSummary.households;
      malePopulation = regionSummary.malePopulation;
      femalePopulation = regionSummary.femalePopulation;
    }
  }

  // ── Regional peak growth ──────────────────────────────────
  const allSummaries = getAllRegionSummaries(currentYear, currentMonth);
  const peakRegionSummary = allSummaries.reduce(
    (best, s) => (s.yoyChangePercent > best.yoyChangePercent ? s : best),
    allSummaries[0] || { regionName: '-', yoyChangePercent: 0 }
  );

  // ── Trend Chart Data ──────────────────────────────────────
  // For national view: show all months across both years
  // For region view: show that region's monthly trend
  const trendRegionName = isNational
    ? "서울특별시" // Use Seoul as representative for national trend line display
    : currentRegion;

  // Build trend data with up to 24 months of data
  const trendRecords = getRegionTrend(trendRegionName);
  const trendData = {
    id: isNational ? "서울특별시" : currentRegion,
    data: trendRecords.map(r => ({
      x: `${r.year}.${r.month.toString().padStart(2, '0')}`,
      y: r.totalPopulation,
    })),
  };

  // If national, also show 경기도 for comparison
  const trendSeries = isNational
    ? [
        trendData,
        {
          id: "경기도",
          data: getRegionTrend("경기도").map(r => ({
            x: `${r.year}.${r.month.toString().padStart(2, '0')}`,
            y: r.totalPopulation,
          })),
        },
      ]
    : [trendData];

  // ── Regional Shift Chart Data ─────────────────────────────
  const shiftData = allSummaries.map(s => ({
    region: s.regionName.replace(/\s+/g, ''),
    change: Number(s.yoyChangePercent.toFixed(2)),
    population: s.latestPopulation,
  }));

  return (
    <div className="flex w-full h-full">
      <Sidebar regions={regions} years={years} months={months} />
      <main className="ml-[280px] flex-grow p-6 overflow-y-auto h-screen w-full custom-scrollbar">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-6">
          
          <header className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-headline-md text-[24px] font-semibold text-on-surface">
                {currentRegion === "전국" ? "전국 인구 현황" : `${currentRegion} 인구 현황`}
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
            peakRegion={peakRegionSummary.regionName?.replace(/\s+/g, '') || '-'}
            peakGrowthPercent={peakRegionSummary.yoyChangePercent || 0}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PopulationTrendChart
                data={trendSeries}
                title={isNational ? "월별 인구 추이 (서울 vs 경기)" : `${currentRegion} 월별 인구 추이`}
              />
            </div>
            <div className="lg:col-span-1">
              <RegionalShiftChart data={shiftData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
