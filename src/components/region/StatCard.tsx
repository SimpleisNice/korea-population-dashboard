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
        padding: "18px 20px",
      }}
    >
      <p
        className="text-[13px] font-medium"
        style={{
          color: "var(--color-text-secondary)",
          margin: "0 0 8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: small ? 30 : 34,
          fontWeight: 800,
          color: "var(--color-text-primary)",
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
        }}
      >
        {typeof value === "number" ? formatNumber(value) : value}
        {unit && (
          <span style={{ fontSize: 14, fontWeight: 500, marginLeft: 3 }}>
            {unit}
          </span>
        )}
      </p>
      {change !== undefined && (
        <p
          className="text-[13px] font-semibold"
          style={{
            margin: "8px 0 0",
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
