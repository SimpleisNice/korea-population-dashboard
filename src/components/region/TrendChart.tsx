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
  height = 180,
  label = '인구',
  unit = '명',
}: Props) {
  const combined: ChartPoint[] = [
    ...data.map(p => ({ label: p.label, population: p.population })),
    ...(forecast ?? []).map(p => ({ label: p.label, forecast: p.forecast })),
  ]

  const boundaryLabel =
    forecast && forecast.length > 0 ? forecast[0].label : null

  // SVG gradient id (color 기반, 특수문자 제거)
  const gradId = `tg_${color.replace(/[^a-z0-9]/gi, '_')}`

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={combined}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                style={{ stopColor: color, stopOpacity: 0.18 }}
              />
              <stop
                offset="90%"
                style={{ stopColor: color, stopOpacity: 0 }}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
            strokeOpacity={0.6}
          />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: 'var(--color-text-secondary)', opacity: 0.55 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={(v: string) => v.slice(2)}
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'var(--color-text-secondary)', opacity: 0.55 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => (v / 10000).toFixed(0) + '만'}
            width={36}
          />

          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              fontSize: 13,
              padding: '8px 12px',
              backgroundColor: 'var(--color-bg)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
            itemStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
            labelStyle={{
              color: 'var(--color-text-secondary)',
              marginBottom: 3,
              fontSize: 11,
            }}
            formatter={(value, name) => {
              if (value == null) return ['', '']
              const tooltipLabel =
                name === 'forecast' ? '예측(참고용)' : label
              return [
                formatNumber(value as number) + unit,
                tooltipLabel,
              ]
            }}
          />

          {/* 예측 경계선 */}
          {boundaryLabel && (
            <ReferenceLine
              x={boundaryLabel}
              stroke="var(--color-border)"
              strokeDasharray="4 2"
              strokeOpacity={0.8}
              label={{
                value: '예측',
                position: 'insideTopRight',
                fontSize: 9,
                fill: 'var(--color-text-secondary)',
                opacity: 0.6,
              }}
            />
          )}

          {/* 그래디언트 Area (실제 데이터) */}
          <Area
            type="monotone"
            dataKey="population"
            fill={`url(#${gradId})`}
            stroke="none"
            dot={false}
            activeDot={false}
            connectNulls={false}
            isAnimationActive={true}
            animationDuration={800}
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
            animationDuration={800}
            animationEasing="ease-out"
          />

          {/* 예측 데이터 선 */}
          {forecast && forecast.length > 0 && (
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              strokeOpacity={0.45}
              dot={false}
              activeDot={{ r: 3, fill: color, fillOpacity: 0.5 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
