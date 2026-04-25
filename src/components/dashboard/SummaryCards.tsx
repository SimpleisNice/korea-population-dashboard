import { Users, TrendingDown, TrendingUp, ArrowDown, MapPin } from "lucide-react";

interface SummaryCardsProps {
  totalPopulation: number;
  yoyChange: number;
  monthlyChange: number;
  peakRegion: string;
  peakGrowth: number;
}

export function SummaryCards({
  totalPopulation,
  yoyChange,
  monthlyChange,
  peakRegion,
  peakGrowth,
}: SummaryCardsProps) {
  const formatPop = (num: number) => (num / 1000000).toFixed(1) + "M";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Total Population */}
      <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/5 transition-colors duration-500 rounded-xl"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">Total Population</h3>
          <Users className="text-primary-container" size={20} />
        </div>
        <div className="flex-grow flex flex-col justify-end relative z-10">
          <div className="font-display-lg text-[48px] font-bold text-on-surface mb-1 leading-none">{formatPop(totalPopulation)}</div>
          <div className={`flex items-center gap-2 ${yoyChange >= 0 ? "text-tertiary-container" : "text-error"}`}>
            {yoyChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-data-mono text-[14px]">{yoyChange > 0 ? "+" : ""}{yoyChange.toFixed(2)}% YoY</span>
          </div>
        </div>
      </div>

      {/* Card 2: Monthly Change */}
      <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-secondary-container/0 group-hover:bg-secondary-container/5 transition-colors duration-500 rounded-xl"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">Monthly Change %</h3>
          <TrendingDown className="text-secondary-container" size={20} />
        </div>
        <div className="flex-grow flex flex-col justify-end relative z-10">
          <div className="font-display-lg text-[48px] font-bold text-on-surface mb-1 leading-none">{monthlyChange > 0 ? "+" : ""}{monthlyChange.toFixed(2)}%</div>
          <div className={`flex items-center gap-2 ${monthlyChange >= 0 ? "text-tertiary-container" : "text-error"}`}>
            <ArrowDown size={16} />
            <span className="font-data-mono text-[14px]">From previous month</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-secondary-container/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Card 3: Regional Peak */}
      <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-tertiary-container/0 group-hover:bg-tertiary-container/5 transition-colors duration-500 rounded-xl"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">Growth Peak (Region)</h3>
          <MapPin className="text-tertiary-container" size={20} />
        </div>
        <div className="flex-grow flex flex-col justify-end relative z-10">
          <div className="font-headline-md text-[24px] font-semibold text-on-surface mb-1">{peakRegion}</div>
          <div className="flex items-center gap-2 text-tertiary-container">
            <TrendingUp size={16} />
            <span className="font-data-mono text-[14px]">+{peakGrowth.toFixed(1)}% Growth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
