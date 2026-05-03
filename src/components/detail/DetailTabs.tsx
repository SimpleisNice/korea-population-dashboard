"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { TrendChart } from "@/components/region/TrendChart";
import { AgeChart } from "./AgeChart";
import { MigrationChart } from "./MigrationChart";
import { StatCard } from "@/components/region/StatCard";
import type { RegionDetail } from "@/lib/types";

const TABS = [
  { id: "trend", label: "인구추이" },
  { id: "household", label: "세대" },
  { id: "age", label: "연령" },
  { id: "migration", label: "전입출" },
];

interface Props {
  detail: RegionDetail;
}

export function DetailTabs({ detail }: Props) {
  const { latest, prevMonth, trend, ageGroups, migration } = detail;

  return (
    <Tabs.Root defaultValue="trend" className="space-y-4">
      <Tabs.List
        className="flex gap-1 rounded-xl"
        style={{ backgroundColor: "var(--color-surface)", padding: 4 }}
        aria-label="상세 정보 탭"
      >
        {TABS.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="flex-1 rounded-lg text-xs font-medium transition-all"
            style={{ height: 36 }}
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="trend">
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            backgroundColor: "var(--color-bg)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            월별 인구 추이
          </p>
          <TrendChart data={trend} />
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "var(--color-text-secondary)" }}>
                <th className="py-1 text-left font-medium">기준월</th>
                <th className="py-1 text-right font-medium">인구</th>
                <th className="py-1 text-right font-medium">증감</th>
              </tr>
            </thead>
            <tbody>
              {[...trend]
                .reverse()
                .slice(0, 6)
                .map((point) => (
                  <tr
                    key={point.label}
                    style={{ borderTop: "1px solid var(--color-border)" }}
                  >
                    <td
                      style={{
                        padding: "8px 0",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {point.label}
                    </td>
                    <td
                      className="text-right font-medium"
                      style={{
                        padding: "8px 0",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {point.population.toLocaleString("ko-KR")}
                    </td>
                    <td
                      className="text-right"
                      style={{
                        padding: "8px 0",
                        color:
                          point.change > 0
                            ? "var(--color-positive)"
                            : point.change < 0
                              ? "var(--color-negative)"
                              : "var(--color-neutral)",
                      }}
                    >
                      {point.change > 0 ? "+" : ""}
                      {point.change.toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Tabs.Content>

      <Tabs.Content value="household">
        <div className="space-y-3">
          <div className="flex gap-3">
            <StatCard
              label="세대수"
              value={latest.households}
              change={
                prevMonth ? latest.households - prevMonth.households : undefined
              }
            />
            <StatCard
              label="세대당 인구"
              value={latest.householdSize}
              unit="명"
            />
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: "var(--color-bg)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <p
              className="mb-3 text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              세대수 추이
            </p>
            <TrendChart
              data={trend.map((t) => ({ ...t, population: t.households }))}
              color="var(--color-positive)"
              height={160}
            />
          </div>
        </div>
      </Tabs.Content>

      <Tabs.Content value="age">
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: "var(--color-bg)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p
            className="mb-3 text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            연령별 인구 구조
          </p>
          <AgeChart data={ageGroups} />
        </div>
      </Tabs.Content>

      <Tabs.Content value="migration">
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: "var(--color-bg)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p
            className="mb-3 text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            전입·전출 현황 (최근 12개월)
          </p>
          <MigrationChart data={migration} />
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
