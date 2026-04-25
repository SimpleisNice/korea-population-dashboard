import { Sidebar } from "@/components/layout/Sidebar";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { PopulationTrendChart } from "@/components/dashboard/PopulationTrendChart";
import { RegionalShiftChart } from "@/components/dashboard/RegionalShiftChart";
import { getPopulationData } from "@/lib/data";
import { Bell, Settings } from "lucide-react";

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const currentYearStr = typeof searchParams.year === 'string' ? searchParams.year : "2024";
  const currentRegion = typeof searchParams.region === 'string' ? searchParams.region : "All Regions";
  const currentYear = parseInt(currentYearStr, 10);

  // Load Data
  const data = await getPopulationData();

  // Filter for current selection
  const regionData = data.filter(d => d.region === currentRegion);
  const currentYearData = regionData.find(d => d.year === currentYear);
  const previousYearData = regionData.find(d => d.year === currentYear - 1);
  
  // Calculations for Summary Cards
  const totalPopulation = currentYearData?.population || 0;
  const prevPop = previousYearData?.population || 1; // avoid div by 0
  const yoyChange = ((totalPopulation - prevPop) / prevPop) * 100;
  
  // Dummy monthly change logic since we only have annual dummy data right now
  const monthlyChange = yoyChange / 12;

  // Regional Shift calculation (All regions YoY)
  const regions = ["Seoul Capital Area", "Gyeonggi-do", "Busan"];
  const shiftData = regions.map(r => {
    const cur = data.find(d => d.region === r && d.year === currentYear)?.population || 0;
    const prev = data.find(d => d.region === r && d.year === currentYear - 1)?.population || 1;
    return {
      region: r.replace(" Capital Area", "").replace("-do", ""), // Shorten labels
      change: Number((((cur - prev) / prev) * 100).toFixed(2))
    };
  });

  const peakRegion = shiftData.reduce((prev, current) => (prev.change > current.change) ? prev : current);

  // Trend Chart Data
  const trendData = {
    id: currentRegion,
    data: regionData
      .filter(d => d.year <= currentYear && d.year >= currentYear - 4) // Last 5 years
      .sort((a, b) => a.year - b.year)
      .map(d => ({
        x: d.year.toString(),
        y: d.population
      }))
  };

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <main className="ml-[280px] flex-grow p-6 overflow-y-auto h-screen w-full custom-scrollbar">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-6">
          
          <header className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-headline-md text-[24px] font-semibold text-on-surface">Overview</h2>
              <p className="font-body-base text-[16px] text-on-surface-variant">Key population metrics for {currentYear}</p>
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
            monthlyChange={monthlyChange}
            peakRegion={peakRegion.region}
            peakGrowth={peakRegion.change}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PopulationTrendChart data={[trendData]} />
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
