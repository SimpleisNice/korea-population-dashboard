"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
import { AgeChart } from "@/components/detail/AgeChart";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Region, RegionDetail, AgeGroup } from "@/lib/types";
import { fetchRegionDetail } from "@/lib/actions";
import { formatNumber } from "@/lib/utils";

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

interface Props {
  regions: Region[];
  availableMonths: string[];
  currentMonth: string;
  initialA: Region | null;
  initialB: Region | null;
  initialDetailA: RegionDetail | null;
  initialDetailB: RegionDetail | null;
}

const COLOR_A = "var(--color-accent)";
const COLOR_B = "var(--color-accent-b)";

function Metric({
  label,
  a,
  b,
  tooltip,
  index,
}: {
  label: string;
  a: number | string;
  b: number | string;
  tooltip?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.28, ease: EASE }}
      className="grid grid-cols-3 items-center gap-2 border-b py-3 text-sm last:border-b-0"
      style={{ borderColor: "var(--color-border)" }}
    >
      <span className="text-center font-semibold" style={{ color: COLOR_A }}>
        {typeof a === "number" ? formatNumber(a) : a}
      </span>
      <span
        className="text-center text-xs"
        style={{ color: "var(--color-text-secondary)" }}
        title={tooltip}
      >
        {label}
        {tooltip && (
          <span style={{ marginLeft: 2, opacity: 0.5, cursor: "help" }}>ⓘ</span>
        )}
      </span>
      <span className="text-center font-semibold" style={{ color: COLOR_B }}>
        {typeof b === "number" ? formatNumber(b) : b}
      </span>
    </motion.div>
  );
}

function calcSexRatio(male: number, female: number): string {
  if (female === 0) return "—";
  return (male / female * 100).toFixed(1);
}

function calcYoyRate(latest: number, yoy: number | undefined): string {
  if (!yoy || yoy === 0) return "—";
  return ((latest - yoy) / yoy * 100).toFixed(2) + "%";
}

function calcAgingIndex(groups: AgeGroup[]): number | null {
  const ELDERLY = ["60–69", "70–79", "80+"];
  const YOUTH = ["0–9", "10–19"];
  const elderly = groups.filter(g => ELDERLY.includes(g.label)).reduce((s, g) => s + g.male + g.female, 0);
  const youth = groups.filter(g => YOUTH.includes(g.label)).reduce((s, g) => s + g.male + g.female, 0);
  if (youth === 0) return null;
  return Math.round(elderly / youth * 100);
}

function calcElderlyRate(ageGroups: AgeGroup[], total: number): string {
  if (total === 0 || ageGroups.length === 0) return "—";
  const elderlyLabels = ["60–69", "70–79", "80+"];
  const elderly = ageGroups
    .filter(g => elderlyLabels.includes(g.label))
    .reduce((s, g) => s + g.male + g.female, 0);
  return (elderly / total * 100).toFixed(1) + "%";
}

function ResultSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* 헤더 행 */}
      <div className="grid grid-cols-3 items-center gap-2 py-3">
        <Skeleton height={20} rounded={6} />
        <Skeleton height={20} width={40} rounded={20} className="mx-auto" />
        <Skeleton height={20} rounded={6} />
      </div>
      {/* 지표 카드 */}
      <div className="rounded-xl px-4" style={{ backgroundColor: "var(--color-bg)", boxShadow: "var(--shadow-card)" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 border-b py-3 last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
            <Skeleton height={16} rounded={4} />
            <Skeleton height={12} width="60%" rounded={4} className="mx-auto" />
            <Skeleton height={16} rounded={4} />
          </div>
        ))}
      </div>
      {/* 차트 카드 */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "var(--color-bg)", boxShadow: "var(--shadow-card)" }}>
        <Skeleton height={14} width="40%" rounded={4} style={{ marginBottom: 16 }} />
        <Skeleton height={180} rounded={8} />
      </div>
    </motion.div>
  );
}

export function CompareClient({
  regions,
  availableMonths,
  currentMonth,
  initialA,
  initialB,
  initialDetailA,
  initialDetailB,
}: Props) {
  const router = useRouter();

  const [regionA, setRegionA] = useState<Region | null>(initialA);
  const [regionB, setRegionB] = useState<Region | null>(initialB);
  const [detailA, setDetailA] = useState<RegionDetail | null>(initialDetailA);
  const [detailB, setDetailB] = useState<RegionDetail | null>(initialDetailB);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  useEffect(() => {
    if (!regionA) { startTransition(() => setDetailA(null)); return; }
    setLoadingA(true);
    fetchRegionDetail(regionA.code, currentMonth).then(d =>
      startTransition(() => { setDetailA(d); setLoadingA(false); })
    );
  }, [regionA, currentMonth]);

  useEffect(() => {
    if (!regionB) { startTransition(() => setDetailB(null)); return; }
    setLoadingB(true);
    fetchRegionDetail(regionB.code, currentMonth).then(d =>
      startTransition(() => { setDetailB(d); setLoadingB(false); })
    );
  }, [regionB, currentMonth]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (regionA) params.set("region_a", regionA.code);
    else params.delete("region_a");
    if (regionB) params.set("region_b", regionB.code);
    else params.delete("region_b");
    router.replace(`/compare?${params.toString()}`, { scroll: false });
  }, [regionA, regionB, router]);

  const mergedTrend = (() => {
    if (!detailA || !detailB) return [];
    return detailA.trend.map((pointA, i) => ({
      label: pointA.label,
      a: pointA.population,
      b: detailB.trend[i]?.population ?? 0,
    }));
  })();

  const isLoading = (regionA && loadingA) || (regionB && loadingB);
  const hasResult = regionA && regionB && detailA && detailB && !isLoading;
  const resultKey = `${regionA?.code ?? ''}-${regionB?.code ?? ''}-${currentMonth}`;

  return (
    <div className="space-y-5">
      {/* 기준월 선택 */}
      <MonthPicker availableMonths={availableMonths} current={currentMonth} />

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

      {/* 비교 결과 / 로딩 / 빈 상태 */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <ResultSkeleton key="loading" />
        ) : hasResult ? (
          <motion.div
            key={resultKey}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="space-y-5"
          >
            {/* VS 헤더 */}
            <div className="grid grid-cols-3 items-center gap-2 py-1">
              <span className="text-[14px] font-bold truncate text-center" style={{ color: COLOR_A }}>
                {regionA!.sigungu}
              </span>
              <span
                className="text-[11px] font-bold rounded-full text-center mx-auto px-3 py-1"
                style={{
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-surface)',
                  display: 'block',
                  width: 'fit-content',
                }}
              >
                VS
              </span>
              <span className="text-[14px] font-bold truncate text-center" style={{ color: COLOR_B }}>
                {regionB!.sigungu}
              </span>
            </div>

            {/* 지표 카드 */}
            <div
              className="rounded-xl px-4"
              style={{
                backgroundColor: "var(--color-bg)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <Metric index={0} label="총 인구" a={detailA!.latest.population} b={detailB!.latest.population} />
              <Metric index={1} label="세대수" a={detailA!.latest.households} b={detailB!.latest.households} />
              <Metric index={2} label="세대당 인구" a={detailA!.latest.householdSize} b={detailB!.latest.householdSize} />
              <Metric index={3} label="남자 인구" a={detailA!.latest.male} b={detailB!.latest.male} />
              <Metric index={4} label="여자 인구" a={detailA!.latest.female} b={detailB!.latest.female} />
              <Metric
                index={5}
                label="성비"
                a={calcSexRatio(detailA!.latest.male, detailA!.latest.female)}
                b={calcSexRatio(detailB!.latest.male, detailB!.latest.female)}
                tooltip="남자 ÷ 여자 × 100. 100 = 균형, 100 초과 = 남자 多"
              />
              <Metric
                index={6}
                label="전년 동월 증감률"
                a={calcYoyRate(detailA!.latest.population, detailA!.yoyMonth?.population)}
                b={calcYoyRate(detailB!.latest.population, detailB!.yoyMonth?.population)}
                tooltip="(현재 인구 − 1년 전 동월 인구) ÷ 1년 전 동월 인구 × 100"
              />
              <Metric
                index={7}
                label="고령 인구 비율"
                a={calcElderlyRate(detailA!.ageGroups, detailA!.latest.population)}
                b={calcElderlyRate(detailB!.ageGroups, detailB!.latest.population)}
                tooltip="60세 이상 인구 ÷ 총인구 × 100 (10세 단위 연령 데이터 기준)"
              />
            </div>

            {/* 인구 추이 비교 차트 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.36, ease: EASE }}
              className="rounded-xl p-4"
              style={{
                backgroundColor: "var(--color-bg)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  인구 추이 비교
                </p>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--color-text-secondary)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="16" height="6">
                      <line x1="0" y1="3" x2="16" y2="3" stroke={COLOR_A} strokeWidth="2" />
                    </svg>
                    {regionA!.sigungu}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="16" height="6">
                      <line x1="0" y1="3" x2="16" y2="3" stroke={COLOR_B} strokeWidth="2" strokeDasharray="4 2" />
                    </svg>
                    {regionB!.sigungu}
                  </span>
                </div>
              </div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergedTrend} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 9, fill: "var(--color-text-secondary)" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      tickFormatter={(v: string) => v.slice(2)}
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
                        v != null ? [formatNumber(v as number) + "명", ""] : ["", ""]
                      }
                    />
                    <Line type="monotone" dataKey="a" stroke={COLOR_A} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive animationDuration={800} animationEasing="ease-out" />
                    <Line type="monotone" dataKey="b" stroke={COLOR_B} strokeWidth={2} dot={false} strokeDasharray="4 2" activeDot={{ r: 4 }} isAnimationActive animationDuration={900} animationEasing="ease-out" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* 연령 구조 비교 */}
            {detailA!.ageGroups.length > 0 && detailB!.ageGroups.length > 0 && (() => {
              const idxA = calcAgingIndex(detailA!.ageGroups);
              const idxB = calcAgingIndex(detailB!.ageGroups);
              const diff = idxA !== null && idxB !== null ? idxA - idxB : null;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.36, ease: EASE }}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "var(--color-bg)", boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      연령 구조 비교
                    </p>
                    <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--color-text-secondary)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "var(--color-accent)", display: "inline-block" }} />
                        {regionA!.sigungu}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "var(--color-accent)", opacity: 0.3, display: "inline-block" }} />
                        {regionB!.sigungu}
                      </span>
                    </div>
                  </div>

                  {idxA !== null && idxB !== null && (
                    <div
                      className="flex items-center gap-3 rounded-lg"
                      style={{ backgroundColor: "var(--color-surface)", padding: "10px 14px", marginBottom: 12 }}
                    >
                      <div className="text-center flex-1">
                        <p className="text-[10px]" style={{ color: "var(--color-text-secondary)", marginBottom: 2 }}>
                          {regionA!.sigungu} 고령화 지수
                        </p>
                        <p className="text-[15px] font-bold" style={{ color: COLOR_A }}>{idxA}</p>
                      </div>
                      <div className="text-center">
                        <p
                          className="text-[13px] font-bold"
                          style={{
                            color: (diff ?? 0) > 0 ? "var(--color-negative)"
                              : (diff ?? 0) < 0 ? "var(--color-positive)"
                              : "var(--color-text-secondary)",
                          }}
                        >
                          {(diff ?? 0) > 0 ? `+${diff}` : diff}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>차이</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-[10px]" style={{ color: "var(--color-text-secondary)", marginBottom: 2 }}>
                          {regionB!.sigungu} 고령화 지수
                        </p>
                        <p className="text-[15px] font-bold" style={{ color: COLOR_B }}>{idxB}</p>
                      </div>
                    </div>
                  )}

                  <AgeChart data={detailA!.ageGroups} compareData={detailB!.ageGroups} />
                </motion.div>
              );
            })()}
          </motion.div>
        ) : (
          /* 빈 상태 */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col items-center rounded-xl p-10"
            style={{
              backgroundColor: "var(--color-bg)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ marginBottom: 14 }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </motion.div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
              두 지역을 선택하면
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              비교 결과가 나타납니다
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
