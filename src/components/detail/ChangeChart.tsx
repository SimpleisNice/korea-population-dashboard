'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import type { TrendPoint } from '@/lib/types'

interface Props {
  data: TrendPoint[]
}

export function ChangeChart({ data }: Props) {
  // skip the first point when change=0 (no prior month available)
  const chartData = data[0]?.change === 0 ? data.slice(1) : data

  return (
    <div style={{ height: 200, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v.toLocaleString('ko-KR')}
            width={48}
          />
          <ReferenceLine y={0} stroke="var(--color-border)" strokeWidth={1} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              fontSize: 12,
              backgroundColor: 'var(--color-bg)',
            }}
            formatter={(v) => {
              const n = v as number
              return [`${n >= 0 ? '+' : ''}${n.toLocaleString('ko-KR')}명`, '증감']
            }}
          />
          <Bar dataKey="change" radius={[3, 3, 0, 0]}>
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
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
