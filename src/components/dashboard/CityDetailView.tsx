"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, MapPin, Download, ArrowRight, Activity, PlusCircle } from "lucide-react";
import { RegionSummary, MonthlyPopulationRecord } from "@/lib/csv-parser";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ResponsiveBar } from "@nivo/bar";

interface CityDetailViewProps {
  regionName: string;
  summary: RegionSummary;
  subSummaries: RegionSummary[];
  trendData: MonthlyPopulationRecord[];
}

export function CityDetailView({
  regionName,
  summary,
  subSummaries,
  trendData,
}: CityDetailViewProps) {
  const formatPop = (num: number) => num.toLocaleString();

  // Gender trend data (yearly)
  const genderData = useMemo(() => {
    const yearlyMap = new Map<number, { male: number; female: number }>();
    trendData.forEach(r => {
      // Keep the latest month for each year
      yearlyMap.set(r.year, { male: r.malePopulation, female: r.femalePopulation });
    });
    
    return Array.from(yearlyMap.entries())
      .map(([year, data]) => ({
        year: String(year),
        male: data.male,
        female: data.female,
      }))
      .sort((a, b) => Number(a.year) - Number(b.year))
      .slice(-4); // Last 4 years
  }, [trendData]);

  // Sparkline data points for main chart
  const sparklineData = trendData.slice(-12);

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <h2 className="font-display-lg text-[48px] font-bold text-primary tracking-tighter mb-2 leading-none">
            {regionName}
          </h2>
          <p className="text-on-surface-variant flex items-center gap-2">
            <MapPin size={16} />
            대한민국 행정구역 상세 인구 통계
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-lg font-label-sm text-[12px] uppercase tracking-wider font-bold shadow-lg shadow-primary-container/20 active:scale-95 transition-transform flex items-center gap-2">
            <Download size={16} /> 보고서 다운로드
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Summary Main Card */}
        <div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[280px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <span className="text-on-surface-variant font-label-sm text-[12px] uppercase tracking-widest mb-4 block">총 거주자 인구</span>
            <div className="flex items-baseline gap-4">
              <span className="font-data-mono text-[56px] leading-none font-bold text-primary tracking-tighter">
                <AnimatedNumber value={summary.latestPopulation} formatter={formatPop} />
              </span>
              <div className={`flex items-center font-data-mono text-sm font-bold px-2 py-1 rounded ${summary.yoyChangePercent >= 0 ? "text-tertiary-fixed-dim bg-tertiary-fixed-dim/10" : "text-error bg-error/10"}`}>
                {summary.yoyChangePercent >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {Math.abs(summary.yoyChangePercent).toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div className="mt-8 h-32 w-full flex items-end gap-1 relative z-10">
            {sparklineData.map((d, i) => {
              const max = Math.max(...sparklineData.map(s => s.totalPopulation));
              const min = Math.min(...sparklineData.map(s => s.totalPopulation)) * 0.95; // Base
              const height = Math.max(10, ((d.totalPopulation - min) / (max - min)) * 100);
              const isLast = i === sparklineData.length - 1;
              return (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm transition-all duration-500 ${isLast ? 'bg-primary-container/80 border-t-2 border-primary-container glow-accent' : 'bg-primary-container/20'}`}
                  style={{ height: `${height}%` }}
                  title={`${d.year}.${d.month}: ${d.totalPopulation.toLocaleString()}명`}
                />
              );
            })}
          </div>
        </div>

        {/* Secondary Stat Cards */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-xl flex-1 flex flex-col justify-center">
            <span className="text-on-surface-variant font-label-sm text-[12px] uppercase tracking-widest mb-2 block">총 세대수</span>
            <div className="font-data-mono text-[24px] font-bold text-secondary mb-1">
              <AnimatedNumber value={summary.households} formatter={formatPop} />
            </div>
            <p className="text-on-surface-variant text-sm">세대당 {summary.latestPopulation > 0 ? (summary.latestPopulation / summary.households).toFixed(2) : '-'}명</p>
          </div>
          <div className="glass-panel p-6 rounded-xl flex-1 flex flex-col justify-center">
            <span className="text-on-surface-variant font-label-sm text-[12px] uppercase tracking-widest mb-2 block">남녀 비율</span>
            <div className="font-data-mono text-[24px] font-bold text-tertiary-fixed-dim mb-1">
              {summary.genderRatio > 0 ? summary.genderRatio.toFixed(2) : '-'}
            </div>
            <p className="text-on-surface-variant text-sm">여성 100명당 남성 수</p>
          </div>
        </div>

        {/* Gender Trends Section */}
        <div className="col-span-12 glass-panel p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-[24px] font-semibold text-primary">연도별 성별 추이</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">여성</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">남성</span>
              </div>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveBar
              data={genderData}
              keys={['male', 'female']}
              indexBy="year"
              margin={{ top: 10, right: 10, bottom: 30, left: 60 }}
              padding={0.4}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={['#ecb2ff', '#00f0ff']}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: 0,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: 0,
                format: value => `${(value / 10000).toFixed(0)}만`,
              }}
              enableGridY={false}
              labelSkipWidth={100}
              labelSkipHeight={100}
              theme={{
                axis: { ticks: { text: { fill: '#b9cacb', fontSize: 12, fontFamily: 'Space Grotesk' } } },
                tooltip: { container: { background: '#111318', color: '#e2e2e8', fontSize: 12 } }
              }}
              tooltip={({ id, value, indexValue }) => (
                <div className="bg-surface-dim/95 px-3 py-2 rounded-lg border border-white/10 shadow-xl">
                  <div className="font-data-mono text-[11px] text-on-surface-variant mb-1">{indexValue}년 {id === 'male' ? '남성' : '여성'}</div>
                  <div className="font-data-mono font-bold">{value.toLocaleString()}명</div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Sub-Regional Statistics Grid */}
        {subSummaries.length > 0 && (
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-6 mt-4">
              <h3 className="font-headline-md text-[24px] font-semibold text-primary">상세 지역 통계</h3>
              <div className="flex gap-2">
                <button className="p-2 glass-panel rounded-lg hover:bg-white/10 transition-colors">
                  <Activity size={20} className="text-on-surface-variant" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subSummaries.slice(0, 9).map((sub, idx) => (
                <div key={sub.regionName} className="glass-panel p-5 rounded-xl hover:border-primary-container/40 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-primary">{sub.regionName.replace(regionName, '').trim() || sub.regionName}</h4>
                      <span className="text-xs text-on-surface-variant font-label-sm uppercase">Population</span>
                    </div>
                    <ArrowRight size={20} className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="font-data-mono text-xl font-bold text-on-surface">
                        <AnimatedNumber value={sub.latestPopulation} formatter={formatPop} />
                      </div>
                      <div className={`text-xs ${sub.yoyChangePercent >= 0 ? "text-tertiary-fixed-dim" : "text-error"}`}>
                        {sub.yoyChangePercent > 0 ? "+" : ""}{sub.yoyChangePercent.toFixed(2)}%
                      </div>
                    </div>
                    {/* Mock sparkline for district */}
                    <div className="w-24 h-12 flex items-end gap-1">
                      {[0.3, 0.5, 0.4, 0.8, 0.9].map((h, i) => (
                        <div key={i} className={`w-2 ${sub.yoyChangePercent >= 0 ? 'bg-primary-container' : 'bg-error'} transition-all`} style={{ height: `${h * 100}%`, opacity: 0.2 + (i * 0.2) }} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {subSummaries.length > 9 && (
                <div className="glass-panel p-5 rounded-xl border-dashed border-white/10 flex items-center justify-center group cursor-pointer hover:bg-white/5 transition-all min-h-[120px]">
                  <div className="text-center">
                    <PlusCircle size={32} className="text-on-surface-variant group-hover:text-primary transition-colors mx-auto" />
                    <p className="text-on-surface-variant mt-2 font-label-sm uppercase">전체 보기 ({subSummaries.length}개)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
