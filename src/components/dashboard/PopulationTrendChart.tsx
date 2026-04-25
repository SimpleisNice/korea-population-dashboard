"use client";

import { ResponsiveLine } from "@nivo/line";

interface TrendDataPoint {
  x: string | number;
  y: number;
}

interface PopulationTrendChartProps {
  data: {
    id: string;
    data: TrendDataPoint[];
  }[];
}

export function PopulationTrendChart({ data }: PopulationTrendChartProps) {
  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-label-sm text-[12px] text-on-surface uppercase tracking-widest">
          Population Trend (2020-2024)
        </h3>
      </div>
      <div className="flex-grow w-full h-full relative" style={{ minHeight: "300px" }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          yFormat=" >-.2f"
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Year",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Population",
            legendOffset: -50,
            legendPosition: "middle",
            format: (value) => `${(value / 1000000).toFixed(1)}M`,
          }}
          enableGridX={false}
          gridYValues={4}
          colors={["#00f0ff"]}
          lineWidth={2}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          enableArea={true}
          areaOpacity={0.15}
          areaBlendMode="lighten"
          useMesh={true}
          theme={{
            axis: {
              domain: { line: { stroke: "rgba(255, 255, 255, 0.1)", strokeWidth: 1 } },
              ticks: { text: { fill: "#b9cacb", fontSize: 11, fontFamily: "Space Grotesk" } },
              legend: { text: { fill: "#b9cacb", fontSize: 12, fontFamily: "Inter" } },
            },
            grid: { line: { stroke: "rgba(255, 255, 255, 0.05)", strokeWidth: 1 } },
            tooltip: {
              container: {
                background: "rgba(17, 19, 24, 0.9)",
                backdropFilter: "blur(20px)",
                color: "#e2e2e8",
                fontSize: 12,
                borderRadius: "8px",
                border: "0.5px solid rgba(255,255,255,0.12)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
