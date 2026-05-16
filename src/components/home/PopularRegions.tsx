"use client";

import { useState } from "react";
import Link from "next/link";
import type { Region } from "@/lib/types";
import { regionPath } from "@/lib/utils";

type Tab = "growth" | "decline" | "aging";

const TABS: { key: Tab; label: string; subtitle: string }[] = [
  { key: "growth",  label: "급증",  subtitle: "최근 12개월 인구 증가율 TOP" },
  { key: "decline", label: "급감",  subtitle: "최근 12개월 인구 감소율 TOP" },
  { key: "aging",   label: "고령화", subtitle: "고령화 지수 최고 지역 TOP" },
];

interface Props {
  growthRegions:  Region[];
  declineRegions: Region[];
  agingRegions:   Region[];
}

export function PopularRegions({ growthRegions, declineRegions, agingRegions }: Props) {
  const [tab, setTab] = useState<Tab>("growth");

  const regionMap: Record<Tab, Region[]> = {
    growth:  growthRegions,
    decline: declineRegions,
    aging:   agingRegions,
  };

  const current = TABS.find(t => t.key === tab)!;
  const regions = regionMap[tab];

  return (
    <section>
      {/* 탭 헤더 */}
      <div style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="rounded-full text-[13px] font-semibold transition-colors"
              style={{
                padding: "5px 14px",
                backgroundColor: tab === t.key ? "var(--color-accent)" : "var(--color-surface)",
                color: tab === t.key ? "#fff" : "var(--color-text-secondary)",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span
          className="text-[11px]"
          style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}
        >
          {current.subtitle} · 시도별 1곳
        </span>
      </div>

      {/* 지역 칩 */}
      <div className="flex flex-wrap gap-2.5">
        {regions.map((region) => (
          <Link
            key={region.code}
            href={regionPath(region.sido, region.sigungu)}
            className="rounded-full border text-sm font-semibold transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
              backgroundColor: "var(--color-bg)",
              height: 40,
              padding: "0 18px",
              display: "inline-flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            {region.sigungu}
          </Link>
        ))}
        {regions.length === 0 && (
          <p className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            데이터를 불러오는 중입니다.
          </p>
        )}
      </div>
    </section>
  );
}
