"use client";

import { ArrowLeftRight, X, Plus } from "lucide-react";

interface ComparisonCity {
  name: string;
  malePopulation: number;
  femalePopulation: number;
  totalPopulation: number;
}

interface DataComparisonProps {
  cities: ComparisonCity[];
  maxPopulation: number;
}

export function DataComparison({ cities, maxPopulation }: DataComparisonProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-headline-md text-[20px] md:text-[24px] text-primary-fixed font-semibold flex items-center gap-2">
        <ArrowLeftRight size={20} className="text-primary-fixed" />
        Data Comparison
      </h2>
      <div className="bg-surface-container-high/30 backdrop-blur-[30px] border-[0.5px] border-white/[0.12] rounded-xl p-6 flex flex-col gap-4">
        {/* City Tags */}
        <div className="flex gap-2 flex-wrap">
          {cities.map((city, i) => (
            <span
              key={city.name}
              className={`${i === 0
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-variant border border-outline-variant text-on-surface'
                } font-label-sm text-[12px] px-3 py-1 rounded-full flex items-center gap-1`}
            >
              {city.name.replace(/\s+/g, '')}
              <X size={14} className="opacity-60 cursor-pointer" />
            </span>
          ))}
          <button className="w-6 h-6 rounded-full border border-dashed border-outline text-outline flex items-center justify-center hover:text-primary hover:border-primary transition-colors">
            <Plus size={14} />
          </button>
        </div>

        {/* Bar Chart */}
        <div className="h-48 flex items-end justify-around border-b border-white/10 pb-2 relative mt-4">
          {/* Y-axis guide lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-t border-dashed border-outline-variant w-full h-0" />
            <div className="border-t border-dashed border-outline-variant w-full h-0" />
            <div className="border-t border-dashed border-outline-variant w-full h-0" />
          </div>

          {cities.map((city, i) => {
            const maleH = maxPopulation > 0 ? (city.malePopulation / maxPopulation) * 100 : 0;
            const femaleH = maxPopulation > 0 ? (city.femalePopulation / maxPopulation) * 100 : 0;
            return (
              <div key={city.name} className="flex gap-1 items-end h-full z-10 w-12 justify-center group relative">
                <div
                  className={`w-3 bg-primary-fixed-dim rounded-t-sm transition-all duration-500 ${i > 0 ? 'opacity-70' : ''}`}
                  style={{ height: `${maleH}%` }}
                />
                <div
                  className={`w-3 bg-secondary-fixed-dim rounded-t-sm transition-all duration-500 ${i > 0 ? 'opacity-70' : ''}`}
                  style={{ height: `${femaleH}%` }}
                />
                {/* Label */}
                <span className="absolute -bottom-6 text-[10px] text-on-surface-variant font-label-sm whitespace-nowrap">
                  {city.name.replace(/\s+/g, '').slice(0, 4)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-1 font-label-sm text-[12px] text-on-surface-variant">
            <div className="w-2 h-2 rounded-full bg-primary-fixed-dim" />
            Male
          </div>
          <div className="flex items-center gap-1 font-label-sm text-[12px] text-on-surface-variant">
            <div className="w-2 h-2 rounded-full bg-secondary-fixed-dim" />
            Female
          </div>
        </div>
      </div>
    </section>
  );
}
