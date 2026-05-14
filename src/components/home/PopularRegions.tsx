import Link from "next/link";
import type { Region } from "@/lib/types";
import { regionPath } from "@/lib/utils";

interface Props {
  regions: Region[];
}

export function PopularRegions({ regions }: Props) {
  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2">
        <p
          className="text-[13px] font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          인구 급증 지역
        </p>
        <span className="text-[11px]" style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}>
          최근 12개월 증가율 TOP 6 · 시도별 1곳
        </span>
      </div>
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
      </div>
    </section>
  );
}
