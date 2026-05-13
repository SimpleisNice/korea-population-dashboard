import { getNationalSummary } from '@/lib/data'
import { formatNumber } from '@/lib/utils'

function formatYM(ym: string) {
  return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4))}월`
}

export function NationalSummary() {
  const summary = getNationalSummary()
  if (!summary) return null

  const isPositive = summary.prevMonthChange > 0
  const isNegative = summary.prevMonthChange < 0

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        padding: '16px 20px',
      }}
    >
      <p
        className="text-[12px] font-medium"
        style={{ color: 'var(--color-text-secondary)', marginBottom: 6 }}
      >
        전국 총 인구 · {formatYM(summary.month)} 기준
      </p>
      <div className="flex items-end justify-between">
        <p
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            lineHeight: 1,
          }}
        >
          {formatNumber(summary.totalPopulation)}
          <span style={{ fontSize: 14, fontWeight: 500, marginLeft: 3 }}>명</span>
        </p>
        {summary.prevMonthChange !== 0 && (
          <p
            className="text-[13px] font-semibold"
            style={{
              color: isPositive
                ? 'var(--color-positive)'
                : isNegative
                  ? 'var(--color-negative)'
                  : 'var(--color-neutral)',
              paddingBottom: 2,
            }}
          >
            {isPositive ? '▲' : '▼'}{' '}
            {Math.abs(summary.prevMonthChange).toLocaleString('ko-KR')} 전월비
          </p>
        )}
      </div>
    </div>
  )
}
