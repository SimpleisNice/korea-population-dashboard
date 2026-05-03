"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CompareSearch } from "./CompareSearch";
import type { Region, RegionDetail } from "@/lib/types";
import { getMockRegionDetail } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

interface Props {
  regions: Region[];
  initialA: Region | null;
  initialB: Region | null;
}

const COLOR_A = "var(--color-accent)";
const COLOR_B = "#7c3aed";

function Metric({
  label,
  a,
  b,
}: {
  label: string;
  a: number | string;
  b: number | string;
}) {
  return (
    <div
      className="grid grid-cols-3 items-center gap-2 border-b py-3 text-sm last:border-b-0"
      style={{ borderColor: "var(--color-border)" }}
    >
      <span
        className="text-center font-semibold"
        style={{ color: "var(--color-accent)" }}
      >
        {typeof a === "number" ? formatNumber(a) : a}
      </span>
      <span
        className="text-center text-xs"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </span>
      <span className="text-center font-semibold" style={{ color: COLOR_B }}>
        {typeof b === "number" ? formatNumber(b) : b}
      </span>
    </div>
  );
}

export function CompareClient({ regions, initialA, initialB }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [regionA, setRegionA] = useState<Region | null>(initialA);
  const [regionB, setRegionB] = useState<Region | null>(initialB);

  const detailA = regionA ? getMockRegionDetail(regionA.code) : null;
  const detailB = regionB ? getMockRegionDetail(regionB.code) : null;

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (regionA) params.set("a", regionA.code);
    else params.delete("a");
    if (regionB) params.set("b", regionB.code);
    else params.delete("b");
    router.replace(`/compare?${params.toString()}`, { scroll: false });
  }, [regionA, regionB]);

  const mergedTrend = (() => {
    if (!detailA || !detailB) return [];
    return detailA.trend.map((pointA, i) => ({
      label: pointA.label,
      a: pointA.population,
      b: detailB.trend[i]?.population ?? 0,
    }));
  })();

  return (
    <div className="space-y-5">
      {/* 지역 선택 */}
      <div className="space-y-3">
        <CompareSearch
          regions={regions}
          label="A"
          selected={regionA}
          onSelect={setRegionA}
          onClear={() => setRegionA(null)}
        />
        <CompareSearch
          regions={regions}
          label="B"
          selected={regionB}
          onSelect={setRegionB}
          onClear={() => setRegionB(null)}
        />
      </div>

      {/* 비교 결과 */}
      {detailA && detailB ? (
        <>
          {/* 컬럼 헤더 */}
          <div className="grid grid-cols-3 text-center text-xs font-semibold py-2">
            <span style={{ color: COLOR_A }}>{regionA!.sigungu}</span>
            <span style={{ color: "var(--color-text-secondary)" }}></span>
            <span style={{ color: COLOR_B }}>{regionB!.sigungu}</span>
          </div>

          {/* 지표 비교 */}
          <div
            className="rounded-xl px-4"
            style={{
              backgroundColor: "var(--color-bg)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <Metric
              label="총 인구"
              a={detailA.latest.population}
              b={detailB.latest.population}
            />
            <Metric
              label="세대수"
              a={detailA.latest.households}
              b={detailB.latest.households}
            />
            <Metric
              label="세대당 인구"
              a={detailA.latest.householdSize}
              b={detailB.latest.householdSize}
            />
            <Metric
              label="남자 인구"
              a={detailA.latest.male}
              b={detailB.latest.male}
            />
            <Metric
              label="여자 인구"
              a={detailA.latest.female}
              b={detailB.latest.female}
            />
          </div>

          {/* 인구 추이 비교 차트 */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: "var(--color-bg)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                인구 추이 비교
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 11,
                  color: "var(--color-text-secondary)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <svg width="16" height="6">
                    <line
                      x1="0"
                      y1="3"
                      x2="16"
                      y2="3"
                      stroke={COLOR_A}
                      strokeWidth="2"
                    />
                  </svg>
                  {regionA!.sigungu}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <svg width="16" height="6">
                    <line
                      x1="0"
                      y1="3"
                      x2="16"
                      y2="3"
                      stroke={COLOR_B}
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                  </svg>
                  {regionB!.sigungu}
                </span>
              </div>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mergedTrend}
                  margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9, fill: "var(--color-text-secondary)" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "var(--color-text-secondary)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (v / 10000).toFixed(0) + "만"}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      fontSize: 12,
                      backgroundColor: "var(--color-bg)",
                    }}
                    formatter={(v) =>
                      v != null
                        ? [formatNumber(v as number) + "명", ""]
                        : ["", ""]
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="a"
                    stroke={COLOR_A}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="b"
                    stroke={COLOR_B}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="4 2"
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div
          className="flex flex-col items-center rounded-xl p-10"
          style={{
            backgroundColor: "var(--color-bg)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: 14 }}
          >
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            두 지역을 선택하면
          </p>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            비교 결과가 나타납니다
          </p>
        </div>
      )}
    </div>
  );
}
