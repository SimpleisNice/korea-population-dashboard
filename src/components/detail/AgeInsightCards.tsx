import type { AgeGroup, MonthlyStats } from "@/lib/types";

const ELDERLY_LABELS = ["60–69", "70–79", "80+"];
const YOUTH_LABELS = ["0–9", "10–19"];
const WORKING_LABELS = ["20–29", "30–39", "40–49", "50–59"];

function sum(groups: AgeGroup[], labels: string[]) {
  return groups
    .filter((g) => labels.includes(g.label))
    .reduce((s, g) => s + g.male + g.female, 0);
}

function calcAgingIndex(groups: AgeGroup[]): string {
  const elderly = sum(groups, ELDERLY_LABELS);
  const youth = sum(groups, YOUTH_LABELS);
  if (youth === 0) return "—";
  return (elderly / youth * 100).toFixed(0);
}

function calcWorkingRate(groups: AgeGroup[], total: number): string {
  if (total === 0) return "—";
  return (sum(groups, WORKING_LABELS) / total * 100).toFixed(1) + "%";
}

function calcSexRatio(male: number, female: number): string {
  if (female === 0) return "—";
  return (male / female * 100).toFixed(1);
}

function calcMedianGroup(groups: AgeGroup[]): string {
  const total = groups.reduce((s, g) => s + g.male + g.female, 0);
  if (total === 0) return "—";
  let cum = 0;
  const half = total / 2;
  for (const g of groups) {
    cum += g.male + g.female;
    if (cum >= half) return g.label + "세";
  }
  return (groups[groups.length - 1]?.label ?? "") + "세";
}

interface CardProps {
  label: string;
  value: string;
  tooltip: string;
  highlight?: boolean;
}

function InsightCard({ label, value, tooltip, highlight }: CardProps) {
  return (
    <div
      className="flex-1 rounded-xl"
      style={{
        backgroundColor: "var(--color-surface)",
        padding: "14px 12px",
        minWidth: 0,
      }}
      title={tooltip}
    >
      <p
        className="text-[11px] font-medium truncate"
        style={{ color: "var(--color-text-secondary)", marginBottom: 6 }}
      >
        {label}
        <span style={{ marginLeft: 2, opacity: 0.45 }}>ⓘ</span>
      </p>
      <p
        className="text-[17px] font-bold"
        style={{
          color: highlight ? "var(--color-accent)" : "var(--color-text-primary)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </p>
    </div>
  );
}

interface Props {
  ageGroups: AgeGroup[];
  latest: MonthlyStats;
}

export function AgeInsightCards({ ageGroups, latest }: Props) {
  if (ageGroups.length === 0) return null;

  const agingIndex = calcAgingIndex(ageGroups);
  const agingNum = parseFloat(agingIndex);
  const isAging = !isNaN(agingNum) && agingNum > 100;

  return (
    <div className="flex gap-2" style={{ marginBottom: 16 }}>
      <InsightCard
        label="고령화 지수"
        value={agingIndex}
        tooltip="60세 이상 / 0~19세 × 100 (10세 단위 근사). 100 초과 시 고령화 진행"
        highlight={isAging}
      />
      <InsightCard
        label="생산가능 비율"
        value={calcWorkingRate(ageGroups, latest.population)}
        tooltip="20~59세 인구 ÷ 총인구 × 100 (15~64세의 10세 단위 근사)"
      />
      <InsightCard
        label="성비"
        value={calcSexRatio(latest.male, latest.female)}
        tooltip="남성 ÷ 여성 × 100. 100 = 균형, 100 초과 = 남성 多"
      />
      <InsightCard
        label="중위 연령대"
        value={calcMedianGroup(ageGroups)}
        tooltip="인구의 절반이 속하는 연령 구간 (누적 50% 기준)"
      />
    </div>
  );
}
