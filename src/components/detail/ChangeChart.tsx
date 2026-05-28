'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Cell,
} from 'recharts'
import type { TrendPoint } from '@/lib/types'
import {
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  AXIS_TICK,
  fmtYAxis,
  fmtXAxis,
  ANIMATION_EASING,
  ANIMATION_DURATION,
} from '@/lib/chart-utils'

interface Props {
  data: TrendPoint[]
}

export function ChangeChart({ data }: Props) {
  // skip the first point when change=0 (no prior month available)
  const chartData = data[0]?.change === 0 ? data.slice(1) : data

  return (
    <div style={{ height: 200, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
            interval="preserveStartEnd"
            tickFormatter={fmtXAxis}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmtYAxis}
            width={40}
          />
          <ReferenceLine y={0} stroke="var(--color-border)" strokeWidth={1} />
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
            labelStyle={TOOLTIP_LABEL_STYLE}
            cursor={{ fill: 'var(--color-border)', fillOpacity: 0.15 }}
            formatter={(v) => {
              const n = v as number
              return [`${n >= 0 ? '+' : ''}${n.toLocaleString('ko-KR')}명`, '증감']
            }}
          />
          <Bar
            dataKey="change"
            radius={[3, 3, 0, 0]}
            isAnimationActive
            animationBegin={0}
            animationDuration={ANIMATION_DURATION}
            animationEasing={ANIMATION_EASING}
          >
            {chartData.map((point, i) => (
              <Cell
                key={i}
                fill={
                  point.change > 0
                    ? 'var(--color-accent)'
                    : point.change < 0
                      ? 'var(--color-negative)'
                      : 'var(--color-border)'
                }
                fillOpacity={point.change > 0 ? 0.85 : point.change < 0 ? 0.8 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
