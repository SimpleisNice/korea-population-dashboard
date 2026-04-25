import { Users, TrendingDown, TrendingUp, Home, MapPin } from "lucide-react";

interface SummaryCardsProps {
  totalPopulation: number;
  yoyChange: number;
  yoyChangePercent: number;
  households: number;
  malePopulation: number;
  femalePopulation: number;
  peakRegion: string;
  peakGrowthPercent: number;
}

export function SummaryCards({
  totalPopulation,
  yoyChange,
  yoyChangePercent,
  households,
  malePopulation,
  femalePopulation,
  peakRegion,
  peakGrowthPercent,
}: SummaryCardsProps) {
  const formatPop = (num: number) => {
    if (num >= 100000000) return (num / 100000000).toFixed(2) + "억";
    if (num >= 10000) return (num / 10000).toFixed(0) + "만";
    return num.toLocaleString();
  };

  const formatChange = (num: number) => {
    const prefix = num > 0 ? "+" : "";
    if (Math.abs(num) >= 10000) return prefix + (num / 10000).toFixed(1) + "만";
    return prefix + num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: Total Population */}
      <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/5 transition-colors duration-500 rounded-xl"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">총 인구</h3>
          <Users className="text-primary-container" size={20} />
        </div>
        <div className="flex-grow flex flex-col justify-end relative z-10">
          <div className="font-display-lg text-[36px] font-bold text-on-surface mb-1 leading-none">{formatPop(totalPopulation)}</div>
          <div className={`flex items-center gap-2 mt-2 ${yoyChangePercent >= 0 ? "text-tertiary-container" : "text-error"}`}>
            {yoyChangePercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-data-mono text-[13px]">
              {yoyChangePercent > 0 ? "+" : ""}{yoyChangePercent.toFixed(2)}% ({formatChange(yoyChange)})
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Households */}
      <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-secondary-container/0 group-hover:bg-secondary-container/5 transition-colors duration-500 rounded-xl"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">세대수</h3>
          <Home className="text-secondary-container" size={20} />
        </div>
        <div className="flex-grow flex flex-col justify-end relative z-10">
          <div className="font-display-lg text-[36px] font-bold text-on-surface mb-1 leading-none">{formatPop(households)}</div>
          <div className="flex items-center gap-2 mt-2 text-on-surface-variant">
            <span className="font-data-mono text-[13px]">
              세대당 {totalPopulation > 0 && households > 0 ? (totalPopulation / households).toFixed(2) : '-'}명
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Gender Ratio */}
      <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary-container/0 group-hover:bg-primary-container/5 transition-colors duration-500 rounded-xl"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">남녀 구성</h3>
          <Users className="text-primary-container" size={20} />
        </div>
        <div className="flex-grow flex flex-col justify-end relative z-10">
          <div className="flex items-baseline gap-3 mb-1">
            <div>
              <span className="font-data-mono text-[13px] text-on-surface-variant">남 </span>
              <span className="font-display-lg text-[24px] font-bold text-on-surface">{formatPop(malePopulation)}</span>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="font-data-mono text-[13px] text-on-surface-variant">여 </span>
              <span className="font-display-lg text-[24px] font-bold text-on-surface">{formatPop(femalePopulation)}</span>
            </div>
          </div>
          {/* Gender ratio bar */}
          <div className="w-full h-2 rounded-full bg-surface-container-highest mt-3 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary-container transition-all duration-700"
              style={{ width: `${malePopulation > 0 ? (malePopulation / (malePopulation + femalePopulation)) * 100 : 50}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 4: Regional Peak */}
      <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-tertiary-container/0 group-hover:bg-tertiary-container/5 transition-colors duration-500 rounded-xl"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">인구 증가 1위</h3>
          <MapPin className="text-tertiary-container" size={20} />
        </div>
        <div className="flex-grow flex flex-col justify-end relative z-10">
          <div className="font-headline-md text-[20px] font-semibold text-on-surface mb-1">{peakRegion || '-'}</div>
          <div className="flex items-center gap-2 text-tertiary-container">
            <TrendingUp size={16} />
            <span className="font-data-mono text-[13px]">
              {peakGrowthPercent > 0 ? "+" : ""}{peakGrowthPercent.toFixed(2)}% 증가
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
