"use client";

import { ResponsiveLine } from "@nivo/line";

interface TrendDataPoint {
  x: string;
  y: number;
}

interface PopulationTrendChartProps {
  data: {
    id: string;
    data: TrendDataPoint[];
  }[];
  title?: string;
}

export function PopulationTrendChart({ data, title = "인구 추이" }: PopulationTrendChartProps) {
  const hasData = data.length > 0 && data[0].data.length > 0;

  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col min-h-[420px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-label-sm text-[12px] text-on-surface uppercase tracking-widest">
          {title}
        </h3>
      </div>
      <div className="flex-grow w-full h-full relative" style={{ minHeight: "320px" }}>
        {hasData ? (
          <ResponsiveLine
            data={data}
            margin={{ top: 20, right: 30, bottom: 50, left: 80 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat=" >-.0f"
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legendOffset: 40,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "인구 (만 명)",
              legendOffset: -65,
              legendPosition: "middle",
              format: (value) => `${(Number(value) / 10000).toFixed(0)}`,
            }}
            enableGridX={false}
            gridYValues={5}
            colors={["#00f0ff", "#cf5cff"]}
            lineWidth={2.5}
            pointSize={6}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            enableArea={true}
            areaOpacity={0.1}
            areaBlendMode="lighten"
            useMesh={true}
            legends={data.length > 1 ? [
              {
                anchor: "top-right",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: -20,
                itemsSpacing: 10,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                symbolSize: 10,
                symbolShape: "circle",
                itemTextColor: "#b9cacb",
              }
            ] : []}
            tooltip={({ point }) => (
              <div className="bg-surface-dim/95 backdrop-blur-xl text-on-surface px-4 py-2 rounded-lg border border-white/10 shadow-xl">
                <div className="font-data-mono text-[11px] text-on-surface-variant mb-0.5">{String(point.seriesId)}</div>
                <div className="font-data-mono text-[13px] font-semibold">{point.data.xFormatted}</div>
                <div className="font-data-mono text-[12px] text-on-surface-variant">
                  {(point.data.y as number).toLocaleString()}명
                </div>
              </div>
            )}
            theme={{
              axis: {
                domain: { line: { stroke: "rgba(255, 255, 255, 0.1)", strokeWidth: 1 } },
                ticks: { text: { fill: "#b9cacb", fontSize: 10, fontFamily: "Space Grotesk" } },
                legend: { text: { fill: "#b9cacb", fontSize: 11, fontFamily: "Inter" } },
              },
              grid: { line: { stroke: "rgba(255, 255, 255, 0.05)", strokeWidth: 1 } },
              crosshair: { line: { stroke: "#00f0ff", strokeWidth: 1, strokeOpacity: 0.5 } },
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-on-surface-variant">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-label-sm text-[12px]">데이터가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
