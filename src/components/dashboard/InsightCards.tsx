"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { RegionSummary } from "@/lib/csv-parser";

interface InsightCardsProps {
  summaries: RegionSummary[];
}

export function InsightCards({ summaries }: InsightCardsProps) {
  // Sort by change amount or percent? Let's use percent.
  const sorted = [...summaries].sort((a, b) => b.yoyChangePercent - a.yoyChangePercent);
  
  const topGainers = sorted.filter(s => s.yoyChangePercent > 0).slice(0, 3);
  const topLosers = [...sorted].sort((a, b) => a.yoyChangePercent - b.yoyChangePercent).filter(s => s.yoyChangePercent < 0).slice(0, 3);

  if (topGainers.length === 0 && topLosers.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up animate-stagger-2">
      {topGainers.length > 0 && (
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-tertiary-container relative overflow-hidden group">
          <div className="absolute inset-0 bg-tertiary-container/0 group-hover:bg-tertiary-container/5 transition-colors duration-500" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <TrendingUp size={20} className="text-tertiary-container" />
            <h3 className="font-headline-md text-[16px] font-semibold text-on-surface">인구 증가 핫스팟</h3>
          </div>
          <div className="flex flex-col gap-2 relative z-10">
            {topGainers.map((g, i) => (
              <div key={g.regionName} className="flex justify-between items-center bg-surface-container/30 px-3 py-2 rounded-lg">
                <span className="font-body-base text-[14px] text-on-surface">
                  <span className="text-on-surface-variant mr-2">{i + 1}</span>
                  {g.regionName.replace(/\s+/g, '')}
                </span>
                <span className="font-data-mono text-[13px] text-tertiary-container">
                  +{g.yoyChangePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {topLosers.length > 0 && (
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-error relative overflow-hidden group">
          <div className="absolute inset-0 bg-error/0 group-hover:bg-error/5 transition-colors duration-500" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <TrendingDown size={20} className="text-error" />
            <h3 className="font-headline-md text-[16px] font-semibold text-on-surface">인구 감소 주의보</h3>
          </div>
          <div className="flex flex-col gap-2 relative z-10">
            {topLosers.map((l, i) => (
              <div key={l.regionName} className="flex justify-between items-center bg-surface-container/30 px-3 py-2 rounded-lg">
                <span className="font-body-base text-[14px] text-on-surface">
                  <span className="text-on-surface-variant mr-2">{i + 1}</span>
                  {l.regionName.replace(/\s+/g, '')}
                </span>
                <span className="font-data-mono text-[13px] text-error">
                  {l.yoyChangePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
