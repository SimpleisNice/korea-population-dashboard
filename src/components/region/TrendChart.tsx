'use client'

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import type { TrendPoint } from '@/lib/types'
import type { ForecastPoint } from '@/lib/utils'
import { formatNumber } from '@/lib/utils'
import {
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_ITEM_STYLE,
  TOOLTIP_LABEL_STYLE,
  AXIS_TICK,
  fmtYAxis,
  fmtXAxis,
} from '@/lib/chart-utils'

interface ChartPoint {
  label: string
  population?: number
  forecast?: number
}

interface Props {
  data: TrendPoint[]
  forecast?: ForecastPoint[]
  color?: string
  height?: number
  label?: string
  unit?: string
}

export function TrendChart({
  data,
  forecast,
  color = 'var(--color-accent)',
  height = 200,
  label = '인구',
  unit = '명',
}: Props) {
  const combined: ChartPoint[] = [
    ...data.map(p => ({ label: p.label, population: p.population })),
    ...(forecast ?? []).map(p => ({ label: p.label, forecast: p.forecast })),
  ]

  const boundaryLabel =
    forecast && forecast.length > 0 ? forecast[0].label : null

  const gradId = `tg_${color.replace(/[^a-z0-9]/gi, '_')}`

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={combined}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  style={{ stopColor: color, stopOpacity: 0.16 }} />
              <stop offset="85%" style={{ stopColor: color, stopOpacity: 0 }} />
            </linearGradient>
          </defs>

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

          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
            labelStyle={TOOLTIP_LABEL_STYLE}
            cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '3 3' }}
            formatter={(value, name) => {
              if (value == null) return ['', '']
              const lbl = name === 'forecast' ? '예측 (참고용)' : label
              return [formatNumber(value as number) + unit, lbl]
            }}
          />

          {boundaryLabel && (
            <ReferenceLine
              x={boundaryLabel}
              stroke="var(--color-border)"
              strokeDasharray="4 2"
              strokeOpacity={0.7}
              label={{
                value: '예측',
                position: 'insideTopRight',
                fontSize: 9,
                fill: 'var(--color-text-secondary)',
                opacity: 0.55,
              }}
            />
          )}

          {/* 그래디언트 Area */}
          <Area
            type="monotone"
            dataKey="population"
            fill={`url(#${gradId})`}
            stroke="none"
            dot={false}
            activeDot={false}
            connectNulls={false}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
          />

          {/* 실제 데이터 선 */}
          <Line
            type="monotone"
            dataKey="population"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: 'var(--color-bg)', strokeWidth: 2 }}
            connectNulls={false}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
          />

          {/* 예측 선 */}
          {forecast && forecast.length > 0 && (
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              strokeOpacity={0.4}
              dot={false}
              activeDot={{ r: 3, fill: color, fillOpacity: 0.45 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
