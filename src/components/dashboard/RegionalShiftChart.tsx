"use client";

import { ResponsiveBar } from "@nivo/bar";

interface ShiftData {
  region: string;
  change: number; // percentage
}

interface RegionalShiftChartProps {
  data: ShiftData[];
}

export function RegionalShiftChart({ data }: RegionalShiftChartProps) {
  // Map data to match Nivo requirements
  // Nivo Bar takes objects like: { region: "Seoul", change: -1.5 }
  
  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-label-sm text-[12px] text-on-surface uppercase tracking-widest">
          Regional Shift (YoY %)
        </h3>
      </div>
      <div className="flex-grow w-full h-full relative" style={{ minHeight: "300px" }}>
        <ResponsiveBar
          data={data}
          keys={["change"]}
          indexBy="region"
          margin={{ top: 20, right: 20, bottom: 40, left: 100 }}
          padding={0.3}
          layout="horizontal"
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={(bar) => (bar.data.change >= 0 ? "#00f89e" : "#ffb4ab")}
          borderRadius={4}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "YoY Change (%)",
            legendPosition: "middle",
            legendOffset: 32,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
          }}
          enableLabel={true}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor="#111318"
          label={(d) => `${d.value > 0 ? "+" : ""}${d.value}%`}
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
