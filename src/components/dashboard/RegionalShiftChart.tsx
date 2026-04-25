"use client";

import { ResponsiveBar } from "@nivo/bar";

interface ShiftData {
  region: string;
  change: number;
  population: number;
  [key: string]: string | number;
}

interface RegionalShiftChartProps {
  data: ShiftData[];
}

export function RegionalShiftChart({ data }: RegionalShiftChartProps) {
  const hasData = data.length > 0;
  // Show top 10 by absolute change
  const displayData = [...data]
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 10);
  
  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col min-h-[420px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-label-sm text-[12px] text-on-surface uppercase tracking-widest">
          지역별 인구 변동 (전년 동월 대비 %)
        </h3>
      </div>
      <div className="flex-grow w-full h-full relative" style={{ minHeight: "320px" }}>
        {hasData ? (
          <ResponsiveBar
            data={displayData}
            keys={["change"]}
            indexBy="region"
            margin={{ top: 10, right: 30, bottom: 40, left: 120 }}
            padding={0.35}
            layout="horizontal"
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={(bar) => {
              const val = bar.data.change as number;
              return val >= 0 ? "#00f89e" : "#ffb4ab";
            }}
            borderRadius={3}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "변동률 (%)",
              legendPosition: "middle",
              legendOffset: 32,
              format: (v) => `${v}%`,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: 0,
            }}
            enableLabel={true}
            labelSkipWidth={20}
            labelSkipHeight={12}
            labelTextColor="#111318"
            label={(d) => `${Number(d.value) > 0 ? "+" : ""}${Number(d.value).toFixed(2)}%`}
            tooltip={({ data: d }) => (
              <div className="bg-surface-dim/95 backdrop-blur-xl text-on-surface px-4 py-2 rounded-lg border border-white/10 shadow-xl">
                <div className="font-data-mono text-[13px] font-semibold">{d.region}</div>
                <div className="font-data-mono text-[12px] text-on-surface-variant">
                  인구: {(d.population as number).toLocaleString()}명
                </div>
                <div className={`font-data-mono text-[12px] ${(d.change as number) >= 0 ? 'text-tertiary-container' : 'text-error'}`}>
                  변동: {(d.change as number) > 0 ? '+' : ''}{(d.change as number).toFixed(2)}%
                </div>
              </div>
            )}
            theme={{
              axis: {
                domain: { line: { stroke: "rgba(255, 255, 255, 0.1)", strokeWidth: 1 } },
                ticks: { text: { fill: "#b9cacb", fontSize: 10, fontFamily: "Inter" } },
                legend: { text: { fill: "#b9cacb", fontSize: 11, fontFamily: "Inter" } },
              },
              grid: { line: { stroke: "rgba(255, 255, 255, 0.05)", strokeWidth: 1 } },
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-on-surface-variant">
            데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
