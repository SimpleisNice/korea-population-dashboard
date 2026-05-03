"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import { regionPath } from "@/lib/utils";

interface RecentRegion {
  sido: string;
  sigungu: string;
}

const STORAGE_KEY = "recent_regions";

export function saveRecentRegion(sido: string, sigungu: string) {
  if (typeof window === "undefined") return;
  const prev: RecentRegion[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) ?? "[]",
  );
  const filtered = prev.filter(
    (r) => !(r.sido === sido && r.sigungu === sigungu),
  );
  const next = [{ sido, sigungu }, ...filtered].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function RecentRegions() {
  const [regions, setRegions] = useState<RecentRegion[]>([]);

  useEffect(() => {
    const stored: RecentRegion[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    setRegions(stored);
  }, []);

  if (regions.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5">
        <Clock size={13} style={{ color: "var(--color-text-secondary)" }} />
        <p
          className="text-[13px] font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          최근 본 지역
        </p>
      </div>
      <div
        className="overflow-hidden rounded-xl border"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-bg)",
        }}
      >
        {regions.map((r, i) => (
          <Link
            key={`${r.sido}-${r.sigungu}`}
            href={regionPath(r.sido, r.sigungu)}
            className="flex items-center justify-between transition-colors hover:bg-[var(--color-surface)]"
            style={{
              height: 64,
              padding: "0 18px",
              borderBottom:
                i < regions.length - 1
                  ? "1px solid var(--color-border)"
                  : "none",
            }}
          >
            <div className="flex items-baseline gap-2">
              <span
                className="text-[15px] font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {r.sigungu}
              </span>
              <span
                className="text-[13px]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {r.sido}
              </span>
            </div>
            <ChevronRight
              size={18}
              style={{ color: "var(--color-accent)", flexShrink: 0 }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
