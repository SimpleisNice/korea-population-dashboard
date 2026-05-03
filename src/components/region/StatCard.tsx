import { formatNumber } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string;
  change?: number;
  unit?: string;
  small?: boolean;
}

export function StatCard({ label, value, change, unit, small }: Props) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className="flex-1 rounded-xl"
      style={{
        backgroundColor: "var(--color-bg)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        padding: 14,
      }}
    >
      <p
        className="mb-1 text-xs font-medium"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: small ? 20 : 28,
          fontWeight: 700,
          color: "var(--color-text-primary)",
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        {typeof value === "number" ? formatNumber(value) : value}
        {unit && (
          <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 2 }}>
            {unit}
          </span>
        )}
      </p>
      {change !== undefined && (
        <p
          className="mt-1 text-xs font-medium"
          style={{
            color: isPositive
              ? "var(--color-positive)"
              : isNegative
                ? "var(--color-negative)"
                : "var(--color-neutral)",
          }}
        >
          {isPositive ? "▲" : isNegative ? "▼" : "–"}{" "}
          {Math.abs(change).toLocaleString("ko-KR")} 전월비
        </p>
      )}
    </div>
  );
}
