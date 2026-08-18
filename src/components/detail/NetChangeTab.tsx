'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
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

/**
 * 인구 증감(순증감) 표시 요소들.
 *
 * ── 이름에 관한 주의 ─────────────────────────────────────────────────────────
 * 이 값은 **전입·전출이 아니다.** 월별 인구의 순증감이며 출생·사망이 섞여 있어
 * 이동량과 다르다. 진짜 이동자 통계는 이 저장소에 없다(KOSIS 국내인구이동통계 필요).
 *
 * 예전에는 "전입출" 탭에서 "순이동"이라는 이름으로 보여줬는데, 갖고 있지 않은
 * 지표의 이름을 쓴 것이었다 → docs/principles.md A3. 라벨을 전부 "증감"으로 바꾸고
 * 같은 데이터를 두 탭에서 두 번 그리던 것도 하나로 합쳤다.
 */

interface Props {
  trend: TrendPoint[]
}

function buildInsight(trend: TrendPoint[]) {
  const recent = trend.slice(-6).filter(p => p.change !== 0)
  const net = recent.reduce((s, p) => s + p.change, 0)
  const upMonths = recent.filter(p => p.change > 0).length
  const downMonths = recent.filter(p => p.change < 0).length

  let sentence: string
  if (upMonths > downMonths + 1) {
    sentence = '인구가 꾸준히 늘고 있는 지역입니다.'
  } else if (downMonths > upMonths + 1) {
    sentence = '인구가 지속적으로 감소하는 지역입니다.'
  } else {
    sentence = '증가와 감소가 혼재하며 인구가 완만하게 변화하고 있습니다.'
  }

  return { net, sentence, months: recent.length }
}

/** 최근 6개월 순증감 한 줄 + 해석 문장 */
export function NetChangeInsight({ trend }: Props) {
  const { net, sentence, months } = buildInsight(trend)
  if (months === 0) return null

  const isPositive = net > 0
  const isNegative = net < 0

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: 'var(--color-accent-light)',
        border: '1px solid #bfdbfe',
        padding: '14px 16px',
        marginBottom: 12,
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
        최근 {months}개월 순증감{' '}
        {(isPositive ? '+' : '') + net.toLocaleString('ko-KR')}명
      </p>
      <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
        {sentence}
      </p>
    </div>
  )
}

/** 데이터 성격 고지 — 순증감이 이동량이 아니라는 점을 남긴다 (principles.md A3·B3) */
export function NetChangeDisclosure() {
  return (
    <p
      className="text-[11px] leading-relaxed"
      style={{ color: 'var(--color-text-secondary)', opacity: 0.7, paddingBottom: 4 }}
    >
      주민등록 인구의 월별 순증감입니다. 출생·사망과 전입·전출이 함께 반영된 값이라
      순수한 이동량과는 다릅니다. 전입·전출 원시 건수는 제공하지 않습니다.
    </p>
  )
}

interface CumulativePoint {
  label: string
  cumulative: number
}

function buildCumulative(trend: TrendPoint[]): CumulativePoint[] {
  let sum = 0
  return trend
    .filter((_, i) => !(i === 0 && trend[0].change === 0))
    .map(p => {
      sum += p.change
      return { label: p.label, cumulative: sum }
    })
}

/** 기간 시작 시점 대비 누적 증감 추이 */
export function CumulativeChangeChart({ trend }: Props) {
  const data = buildCumulative(trend)
  const lastValue = data[data.length - 1]?.cumulative ?? 0
  const isNet = lastValue >= 0

  // CSS 변수는 SVG presentation attribute 로 동작하지 않아 hex 를 직접 쓴다
  const strokeColor = isNet ? '#2563eb' : '#dc2626'
  const stopColor = strokeColor

  return (
    <div style={{ height: 180, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="netChangeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor, stopOpacity: 0.22 }} />
              <stop offset="90%" style={{ stopColor, stopOpacity: 0 }} />
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
          <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="4 3" strokeWidth={1} />
          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
            labelStyle={TOOLTIP_LABEL_STYLE}
            cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '3 3' }}
            formatter={(v) => {
              const n = v as number
              return [`${n >= 0 ? '+' : ''}${n.toLocaleString('ko-KR')}명`, '누적 증감']
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={strokeColor}
            strokeWidth={1.8}
            fill="url(#netChangeGrad)"
            dot={false}
            activeDot={{ r: 4, fill: strokeColor, stroke: 'var(--color-bg)', strokeWidth: 2 }}
            isAnimationActive
            animationBegin={0}
            animationDuration={ANIMATION_DURATION}
            animationEasing={ANIMATION_EASING}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
