import Link from "next/link";
import type { Region } from "@/lib/types";
import { regionPath } from "@/lib/utils";

interface Props {
  regions: Region[];
}

export function PopularRegions({ regions }: Props) {
  return (
    <section>
      <p
        className="mb-3 text-[13px] font-medium"
        style={{ color: "var(--color-text-secondary)" }}
      >
        인기 지역
      </p>
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
