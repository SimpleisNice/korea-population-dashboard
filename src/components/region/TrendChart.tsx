'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { TrendPoint } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

interface Props {
  data: TrendPoint[]
  color?: string
  height?: number
}

export function TrendChart({ data, color = 'var(--color-accent)', height = 180 }: Props) {
  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
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
            formatter={(value) => value != null ? [formatNumber(value as number) + '명', '인구'] : ['', '인구']}
            labelStyle={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}
          />
          <Line
            type="monotone"
            dataKey="population"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
