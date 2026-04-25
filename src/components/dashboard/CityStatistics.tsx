"use client";

import { ChevronRight } from "lucide-react";

interface CityStatItem {
  regionName: string;
  population: number;
  maleRatio: number;  // 0-100
  femaleRatio: number; // 0-100
}

interface CityStatisticsProps {
  cities: CityStatItem[];
  onCityClick?: (regionName: string) => void;
}

export function CityStatistics({ cities, onCityClick }: CityStatisticsProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-headline-md text-[20px] md:text-[24px] text-primary-fixed font-semibold">
        City Statistics
      </h2>
      <div className="flex flex-col gap-3">
        {cities.map((city) => (
          <button
            key={city.regionName}
            onClick={() => onCityClick?.(city.regionName)}
            className="bg-surface-container/50 backdrop-blur-[20px] border-[0.5px] border-white/[0.12] rounded-lg p-4 flex items-center justify-between hover:bg-surface-container-high/60 transition-colors w-full text-left group"
          >
            <div className="flex flex-col gap-1">
              <span className="font-body-base text-[16px] font-semibold text-on-surface">
                {city.regionName.replace(/\s+/g, '')}
              </span>
              <span className="font-data-mono text-[14px] text-on-surface-variant">
                {city.population.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Mini gender ratio bar */}
              <div className="w-16 h-1 rounded-full bg-surface-container-lowest flex overflow-hidden">
                <div
                  className="h-full bg-primary-fixed-dim"
                  style={{ width: `${city.maleRatio}%` }}
                />
                <div
                  className="h-full bg-secondary-fixed-dim"
                  style={{ width: `${city.femaleRatio}%` }}
                />
              </div>
              <ChevronRight size={20} className="text-outline-variant group-hover:text-on-surface transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
