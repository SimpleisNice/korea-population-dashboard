'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { MigrationPoint } from '@/lib/types'

interface Props {
  data: MigrationPoint[]
}

export function MigrationChart({ data }: Props) {
  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 11, color: 'var(--color-text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="20" height="8">
            <line x1="0" y1="4" x2="20" y2="4" stroke="var(--color-positive)" strokeWidth="2" />
          </svg>
          전입
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="20" height="8">
            <line x1="0" y1="4" x2="20" y2="4" stroke="var(--color-negative)" strokeWidth="2" />
          </svg>
          전출
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="20" height="8">
            <line x1="0" y1="4" x2="20" y2="4" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          순이동
        </span>
      </div>
      <div style={{ height: 180, width: '100%' }}>
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
              tickFormatter={v => v.toLocaleString('ko-KR')}
              width={44}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                fontSize: 12,
                backgroundColor: 'var(--color-bg)',
              }}
              formatter={(v) => v != null ? [(v as number).toLocaleString('ko-KR'), ''] : ['', '']}
            />
            <Line type="monotone" dataKey="inflow" name="전입" stroke="var(--color-positive)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="outflow" name="전출" stroke="var(--color-negative)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="net" name="순이동" stroke="var(--color-accent)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
