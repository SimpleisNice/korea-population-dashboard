import type { AgeGroup } from "@/lib/types";

interface Props {
  data: AgeGroup[];
  compareData?: AgeGroup[];
}

export function AgeChart({ data, compareData }: Props) {
  const allVals = [
    ...data.flatMap((d) => [d.male, d.female]),
    ...(compareData ?? []).flatMap((d) => [d.male, d.female]),
  ];
  const maxVal = Math.max(...allVals);
  const total = data.reduce((s, d) => s + d.male + d.female, 0);

  const barH = 18;
  const gap = 8;
  const padL = 44;
  const padR = 60; // 퍼센트 레이블 공간
  const barGap = 2;
  const W = 360;
  const totalH = data.length * (barH * 2 + gap + barGap) + 28;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${totalH}`} style={{ width: "100%" }}>
        {/* Legend */}
        <rect x={padL} y={4} width={8} height={8} rx={2} fill="#2563EB" fillOpacity="0.85" />
        <text x={padL + 12} y={12} fontSize="9" fill="#6B7280">남자</text>
        <rect x={padL + 46} y={4} width={8} height={8} rx={2} fill="#F97316" fillOpacity="0.8" />
        <text x={padL + 58} y={12} fontSize="9" fill="#6B7280">여자</text>
        {compareData && (
          <>
            <rect x={padL + 96} y={4} width={8} height={8} rx={2} fill="#9CA3AF" fillOpacity="0.4" />
            <text x={padL + 108} y={12} fontSize="9" fill="#6B7280">비교</text>
          </>
        )}

        {data.map((d, i) => {
          const cmp = compareData?.[i];
          const y = 28 + i * (barH * 2 + gap + barGap);
          const availW = W - padL - padR;
          const mW = maxVal > 0 ? Math.max(2, (d.male / maxVal) * availW) : 2;
          const fW = maxVal > 0 ? Math.max(2, (d.female / maxVal) * availW) : 2;
          const cmW = cmp && maxVal > 0 ? Math.max(2, (cmp.male / maxVal) * availW) : 0;
          const cfW = cmp && maxVal > 0 ? Math.max(2, (cmp.female / maxVal) * availW) : 0;
          const groupTotal = d.male + d.female;
          const pct = total > 0 ? ((groupTotal / total) * 100).toFixed(1) : "0";

          return (
            <g key={d.label}>
              {/* 연령대 레이블 */}
              <text
                x={padL - 4}
                y={y + barH - 3}
                textAnchor="end"
                fontSize="9"
                fill="#6B7280"
              >
                {d.label}
              </text>

              {/* 비교 시점 막대 (배경) */}
              {cmp && (
                <>
                  <rect x={padL} y={y} width={cmW} height={barH} rx={2} fill="#2563EB" fillOpacity="0.2" />
                  <rect x={padL} y={y + barH + barGap} width={cfW} height={barH} rx={2} fill="#F97316" fillOpacity="0.18" />
                </>
              )}

              {/* 현재 시점 막대 */}
              <rect x={padL} y={y} width={mW} height={barH} rx={2} fill="#2563EB" fillOpacity="0.85" />
              <rect x={padL} y={y + barH + barGap} width={fW} height={barH} rx={2} fill="#F97316" fillOpacity="0.8" />

              {/* 퍼센트 레이블 */}
              <text
                x={W - padR + 4}
                y={y + barH - 3}
                fontSize="9"
                fill="#9CA3AF"
              >
                {pct}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
