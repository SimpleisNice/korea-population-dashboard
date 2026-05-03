import type { AgeGroup } from "@/lib/types";

interface Props {
  data: AgeGroup[];
}

export function AgeChart({ data }: Props) {
  const maxVal = Math.max(...data.flatMap((d) => [d.male, d.female]));
  const barH = 18;
  const gap = 6;
  const padL = 40;
  const padR = 8;
  const barGap = 3;
  const W = 360;
  const totalH = data.length * (barH * 2 + gap + barGap) + 24;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${totalH}`} style={{ width: "100%" }}>
        {/* Legend */}
        <rect x={padL} y={4} width={10} height={10} rx={2} fill="#2563EB" />
        <text x={padL + 14} y={13} fontSize="9" fill="#6B7280">
          남자
        </text>
        <rect
          x={padL + 50}
          y={4}
          width={10}
          height={10}
          rx={2}
          fill="#F97316"
        />
        <text x={padL + 64} y={13} fontSize="9" fill="#6B7280">
          여자
        </text>

        {data.map((d, i) => {
          const y = 24 + i * (barH * 2 + gap + barGap);
          const availW = W - padL - padR;
          const mW = Math.max(2, (d.male / maxVal) * availW);
          const fW = Math.max(2, (d.female / maxVal) * availW);
          return (
            <g key={d.label}>
              <text
                x={padL - 4}
                y={y + barH - 2}
                textAnchor="end"
                fontSize="9"
                fill="#6B7280"
              >
                {d.label}
              </text>
              <rect
                x={padL}
                y={y}
                width={mW}
                height={barH}
                rx={3}
                fill="#2563EB"
                fillOpacity="0.85"
              />
              <rect
                x={padL}
                y={y + barH + barGap}
                width={fW}
                height={barH}
                rx={3}
                fill="#F97316"
                fillOpacity="0.75"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
