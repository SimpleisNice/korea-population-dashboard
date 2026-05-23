'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { ChangeChart } from './ChangeChart'
import type { TrendPoint } from '@/lib/types'

interface Props {
  trend: TrendPoint[]
}

function buildInsight(trend: TrendPoint[]) {
  const recent = trend.slice(-6).filter((p) => p.change !== 0)
  const net = recent.reduce((s, p) => s + p.change, 0)
  const upMonths = recent.filter((p) => p.change > 0).length
  const downMonths = recent.filter((p) => p.change < 0).length

  let sentence: string
  if (upMonths > downMonths + 1) {
    sentence = '인구가 꾸준히 유입되는 지역입니다.'
  } else if (downMonths > upMonths + 1) {
    sentence = '인구가 지속적으로 감소하는 지역입니다.'
  } else {
    sentence = '유입·유출이 혼재하며 인구가 완만하게 변화하고 있습니다.'
  }

  return { net, sentence }
}

function buildCumulative(trend: TrendPoint[]) {
  let sum = 0
  return trend
    .filter((_, i) => !(i === 0 && trend[0].change === 0))
    .map((p) => {
      sum += p.change
      return { label: p.label, cumulative: sum }
    })
}

export function MigrationTab({ trend }: Props) {
  const { net, sentence } = buildInsight(trend)
  const cumulativeData = buildCumulative(trend)
  const isPositive = net > 0
  const isNegative = net < 0

  return (
    <div className="space-y-3">
      {/* 인사이트 카드 */}
      <div
        className="rounded-xl"
        style={{
          backgroundColor: 'var(--color-accent-light)',
          border: '1px solid #bfdbfe',
          padding: '14px 16px',
        }}
      >
        <p
          className="text-[15px] font-bold leading-snug"
          style={{
            color: isPositive
              ? 'var(--color-positive)'
              : isNegative
                ? 'var(--color-negative)'
                : 'var(--color-accent)',
            marginBottom: 4,
          }}
        >
          {isPositive ? '▲' : isNegative ? '▼' : '—'}{' '}
          최근 6개월 순이동{' '}
          {(isPositive ? '+' : '') + net.toLocaleString('ko-KR')}명
        </p>
        <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
          {sentence}
        </p>
      </div>

      {/* 월별 순이동 바 차트 */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)', marginBottom: 12 }}>
          월별 순이동
        </p>
        <ChangeChart data={trend} />
      </div>

      {/* 누적 순이동 추이 */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)', marginBottom: 12 }}>
          누적 순이동 추이
        </p>
        <CumulativeChart data={cumulativeData} />
      </div>

      {/* 데이터 고지 */}
      <p
        className="text-[11px] leading-relaxed"
        style={{ color: 'var(--color-text-secondary)', opacity: 0.7, paddingBottom: 4 }}
      >
        주민등록 인구통계 기준 순이동 추이입니다. 전입·전출 원시 건수 데이터는 포함되지 않습니다.
      </p>
    </div>
  )
}

interface CumulativePoint {
  label: string
  cumulative: number
}

function CumulativeChart({ data }: { data: CumulativePoint[] }) {
  const lastValue = data[data.length - 1]?.cumulative ?? 0
  const isNet = lastValue >= 0

  return (
    <div style={{ height: 180, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="migGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isNet ? 'var(--color-accent)' : 'var(--color-negative)'}
                stopOpacity={0.15}
              />
              <stop
                offset="95%"
                stopColor={isNet ? 'var(--color-accent)' : 'var(--color-negative)'}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
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
            tickFormatter={(v) => v.toLocaleString('ko-KR')}
            width={48}
          />
          <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="4 3" strokeWidth={1} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              fontSize: 12,
              backgroundColor: 'var(--color-bg)',
            }}
            formatter={(v) => {
              const n = v as number
              return [`${n >= 0 ? '+' : ''}${n.toLocaleString('ko-KR')}명`, '누적 순이동']
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={isNet ? 'var(--color-accent)' : 'var(--color-negative)'}
            strokeWidth={2}
            fill="url(#migGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
