/**
 * 모든 차트 컴포넌트에서 공유하는 스타일 상수 및 포맷터.
 */

// ── 공통 Tooltip 스타일 ──────────────────────────────────────────────────────

export const TOOLTIP_CONTENT_STYLE: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  fontSize: 13,
  padding: '8px 12px',
  backgroundColor: 'var(--color-bg)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
}

export const TOOLTIP_ITEM_STYLE: React.CSSProperties = {
  color: 'var(--color-text-primary)',
  fontWeight: 600,
}

export const TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  marginBottom: 3,
  fontSize: 11,
}

// ── 공통 Axis 스타일 ─────────────────────────────────────────────────────────

export const AXIS_TICK = {
  fontSize: 9,
  fill: 'var(--color-text-secondary)',
  opacity: 0.55,
}

// ── 포맷터 ───────────────────────────────────────────────────────────────────

/**
 * Y축 숫자 포맷:
 * - 10,000 이상: "12만" (만 단위, 소수점 생략)
 * - 1,000 이상: "1.2천" (천 단위)
 * - 그 외: 원본 숫자
 */
export function fmtYAxis(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 100_000_000) return (value / 100_000_000).toFixed(1) + '억'
  if (abs >= 10_000) return Math.round(value / 10_000) + '만'
  if (abs >= 1_000) return (value / 1_000).toFixed(1).replace('.0', '') + '천'
  return String(value)
}

/**
 * X축 레이블 포맷:
 * "2024.06" → "24.6"  (2자리 연도 + 선행 0 제거 월)
 * "2024.01" → "24.1"
 */
export function fmtXAxis(label: string): string {
  const year = label.slice(2, 4)       // "24"
  const month = parseInt(label.slice(5)) // 6
  return `${year}.${month}`
}
