'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
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

export function TrendChart({ data, forecast, color = 'var(--color-accent)', height = 180, label = '인구', unit = '명' }: Props) {
  const combined: ChartPoint[] = [
    ...data.map(p => ({ label: p.label, population: p.population })),
    ...(forecast ?? []).map(p => ({ label: p.label, forecast: p.forecast })),
  ]

  // 실제↔예측 경계 label (첫 번째 예측 포인트 앞)
  const boundaryLabel = forecast && forecast.length > 0 ? forecast[0].label : null

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={combined} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={(v: string) => v.slice(2)}
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => (v / 10000).toFixed(0) + '만'}
            width={36}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              fontSize: 12,
              padding: '6px 10px',
              backgroundColor: 'var(--color-bg)',
            }}
            formatter={(value, name) => {
              if (value == null) return ['', '']
              const tooltipLabel = name === 'forecast' ? '예측(참고용)' : label
              return [formatNumber(value as number) + unit, tooltipLabel]
            }}
            labelStyle={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}
          />
          {boundaryLabel && (
            <ReferenceLine
              x={boundaryLabel}
              stroke="var(--color-border)"
              strokeDasharray="4 2"
              label={{ value: '예측', position: 'insideTopRight', fontSize: 9, fill: 'var(--color-text-secondary)' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="population"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
            connectNulls={false}
          />
          {forecast && forecast.length > 0 && (
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={color}
              strokeWidth={2}
              strokeDasharray="5 3"
              strokeOpacity={0.5}
              dot={false}
              activeDot={{ r: 4, fill: color, fillOpacity: 0.5 }}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
