import { TrendingDown, TrendingUp } from "lucide-react";

interface TotalPopulationCardProps {
  totalPopulation: number;
  yoyChangePercent: number;
  malePopulation: number;
  femalePopulation: number;
  regionLabel?: string;
}

export function TotalPopulationCard({
  totalPopulation,
  yoyChangePercent,
  malePopulation,
  femalePopulation,
  regionLabel = "Korea",
}: TotalPopulationCardProps) {
  const total = malePopulation + femalePopulation;
  const malePercent = total > 0 ? ((malePopulation / total) * 100).toFixed(1) : "50.0";
  const femalePercent = total > 0 ? ((femalePopulation / total) * 100).toFixed(1) : "50.0";
  const isPositive = yoyChangePercent >= 0;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-headline-md text-[20px] md:text-[24px] text-primary-fixed font-semibold">
        Total Population ({regionLabel})
      </h2>
      <div className="bg-surface-container-high/40 backdrop-blur-[20px] border-[0.5px] border-white/[0.12] rounded-xl p-6 flex flex-col gap-5 relative overflow-hidden">
        {/* Accent glow */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-primary-container/5 to-transparent pointer-events-none" />
        
        <div className="flex justify-between items-start z-10">
          <div className="flex flex-col">
            <span className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest">Total Count</span>
            <span className="font-display-lg text-[36px] md:text-[48px] font-bold font-data-mono text-primary leading-none mt-1">
              {totalPopulation.toLocaleString()}
            </span>
          </div>
          {/* YoY badge */}
          <div className={`${isPositive ? 'bg-tertiary-container/20 border-tertiary-container/50' : 'bg-error/10 border-error/30'} border px-3 py-1 rounded-full flex items-center gap-1`}>
            {isPositive ? (
              <TrendingUp size={14} className="text-tertiary-fixed" />
            ) : (
              <TrendingDown size={14} className="text-tertiary-fixed" />
            )}
            <span className="font-data-mono text-[14px] text-tertiary-fixed">
              {isPositive ? "+" : ""}{yoyChangePercent.toFixed(1)}% YoY
            </span>
          </div>
        </div>

        {/* Gender Breakdown Bar */}
        <div className="flex flex-col gap-2 z-10 pt-2">
          <div className="flex justify-between font-label-sm text-[12px] text-on-surface-variant">
            <span>Male <span className="font-data-mono text-primary-fixed ml-1">{malePercent}%</span></span>
            <span>Female <span className="font-data-mono text-secondary-fixed ml-1">{femalePercent}%</span></span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-container-lowest flex overflow-hidden">
            <div className="h-full bg-primary-fixed-dim transition-all duration-700" style={{ width: `${malePercent}%` }} />
            <div className="h-full bg-secondary-fixed-dim transition-all duration-700" style={{ width: `${femalePercent}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
