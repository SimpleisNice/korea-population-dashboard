'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import {
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  AXIS_TICK,
  fmtYAxis,
  ANIMATION_EASING,
  ANIMATION_DURATION,
} from '@/lib/chart-utils'

export interface YoYPoint {
  label: string          // "2월"
  thisYear: number | null
  lastYear: number | null
}

interface Props {
  data: YoYPoint[]
  thisYearLabel: string  // e.g. "2026년"
  lastYearLabel: string  // e.g. "2025년"
}

// CSS 변수는 SVG 속성으로 직접 쓸 수 없으므로 hex 사용
const THIS_COLOR = '#2563eb'   // accent
const LAST_COLOR = '#94a3b8'   // neutral-400

export function YoYBarChart({ data, thisYearLabel, lastYearLabel }: Props) {
  const validData = data.filter(d => d.thisYear !== null || d.lastYear !== null)

  if (validData.length === 0) {
    return (
      <div
        style={{
          height: 190,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          비교할 데이터가 없습니다
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* 범례 */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: THIS_COLOR }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
            }}
          >
            {thisYearLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: LAST_COLOR }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              opacity: 0.75,
            }}
          >
            {lastYearLabel}
          </span>
        </div>
      </div>

      {/* 차트 */}
      <div style={{ height: 180, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={validData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            barCategoryGap="28%"
            barGap={3}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              tickFormatter={fmtYAxis}
              width={40}
            />
            <Tooltip
              contentStyle={TOOLTIP_CONTENT_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              labelStyle={TOOLTIP_LABEL_STYLE}
              cursor={{ fill: 'var(--color-border)', fillOpacity: 0.12 }}
              formatter={(value, name) => {
                if (value == null) return ['', '']
                const v = value as number
                const lbl = name === 'thisYear' ? thisYearLabel : lastYearLabel
                return [`${v.toLocaleString('ko-KR')}명`, lbl]
              }}
            />
            {/* 올해 — 먼저 등장 */}
            <Bar
              dataKey="thisYear"
              fill={THIS_COLOR}
              fillOpacity={0.88}
              radius={[3, 3, 0, 0]}
              maxBarSize={30}
              isAnimationActive
              animationBegin={0}
              animationDuration={ANIMATION_DURATION}
              animationEasing={ANIMATION_EASING}
            />
            {/* 작년 — 약간 딜레이 후 등장 */}
            <Bar
              dataKey="lastYear"
              fill={LAST_COLOR}
              fillOpacity={0.65}
              radius={[3, 3, 0, 0]}
              maxBarSize={30}
              isAnimationActive
              animationBegin={180}
              animationDuration={ANIMATION_DURATION}
              animationEasing={ANIMATION_EASING}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
