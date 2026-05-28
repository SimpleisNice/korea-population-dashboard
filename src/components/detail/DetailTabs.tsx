'use client'

import { useState, useRef } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { motion, AnimatePresence } from 'motion/react'
import { TrendChart } from '@/components/region/TrendChart'
import { AgeCompareTab } from './AgeCompareTab'
import { AgeInsightCards } from './AgeInsightCards'
import { ChangeChart } from './ChangeChart'
import { MigrationTab } from './MigrationTab'
import { StatCard } from '@/components/region/StatCard'
import type { RegionDetail, TrendPoint, MonthlyStats } from '@/lib/types'
import { buildForecast } from '@/lib/utils'

type Range = '6' | '12' | 'all'
const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: '6',   label: '6개월' },
  { value: '12',  label: '12개월' },
  { value: 'all', label: '전체' },
]

const TABS = [
  { id: 'trend',     label: '인구추이' },
  { id: 'household', label: '세대' },
  { id: 'age',       label: '연령' },
  { id: 'change',    label: '증감' },
  { id: 'migration', label: '전입출' },
]

const CONTENT_EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
const TAB_IDS = TABS.map(t => t.id)

interface Props {
  detail: RegionDetail
  regionCode: string
  currentMonth: string
  availableMonths: string[]
}

function sliceTrend(trend: TrendPoint[], range: Range): TrendPoint[] {
  if (range === 'all') return trend
  const n = parseInt(range)
  return trend.slice(-n)
}

export function DetailTabs({ detail, regionCode, currentMonth, availableMonths }: Props) {
  const { latest, prevMonth, trend, ageGroups } = detail
  const [range, setRange] = useState<Range>('12')
  const [activeTab, setActiveTab] = useState('trend')
  const prevTabRef = useRef('trend')
  const tabBarRef = useRef<HTMLDivElement>(null)

  function handleTabChange(tab: string) {
    prevTabRef.current = activeTab
    setActiveTab(tab)
    // 탭 바 위치로 부드럽게 스크롤
    setTimeout(() => {
      tabBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  function getDirection(from: string, to: string): 1 | -1 {
    return TAB_IDS.indexOf(to) > TAB_IDS.indexOf(from) ? 1 : -1
  }

  const visibleTrend = sliceTrend(trend, range)
  const forecast = buildForecast(visibleTrend, 6)
  const direction = getDirection(prevTabRef.current, activeTab)

  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      {/* sticky 탭 바 */}
      <div ref={tabBarRef}>
      <Tabs.List
        className="flex gap-1 rounded-xl sticky z-20"
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: 4,
          top: 56,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
        aria-label="상세 정보 탭"
      >
        {TABS.map(tab => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="flex-1 rounded-lg text-[13px] font-semibold transition-colors"
            style={{ height: 36, position: 'relative' }}
          >
            {/* spring으로 이동하는 active 배경 */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="detailTabBg"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 8,
                  backgroundColor: 'var(--color-bg)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  zIndex: 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      </div>

      {/* 인구추이 탭 */}
      <Tabs.Content value="trend" forceMount style={{ display: activeTab === 'trend' ? undefined : 'none' }}>
        <motion.div
          key="trend"
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: CONTENT_EASE }}
        >
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                월별 인구 추이
              </p>
              <RangeToggle value={range} onChange={setRange} />
            </div>
            <TrendChart data={visibleTrend} forecast={forecast} />
            <TrendTable trend={visibleTrend} />
          </div>
        </motion.div>
      </Tabs.Content>

      {/* 세대 탭 */}
      <Tabs.Content value="household" forceMount style={{ display: activeTab === 'household' ? undefined : 'none' }}>
        <motion.div
          key="household"
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: CONTENT_EASE }}
          className="space-y-3"
        >
          <div className="flex gap-3">
            <StatCard
              label="세대수"
              value={latest.households}
              unit="세대"
              change={prevMonth ? latest.households - prevMonth.households : undefined}
            />
            <StatCard
              label="세대당 인구"
              value={latest.householdSize}
              unit="명"
              toFixed={2}
              change={prevMonth ? parseFloat((latest.householdSize - prevMonth.householdSize).toFixed(2)) : undefined}
            />
          </div>
          <HouseholdInsight trend={visibleTrend} latest={latest} />
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                세대수 추이
              </p>
              <RangeToggle value={range} onChange={setRange} />
            </div>
            <TrendChart
              data={visibleTrend.map(t => ({ ...t, population: t.households }))}
              color="var(--color-positive)"
              label="세대"
              unit="세대"
              height={160}
            />
          </div>
        </motion.div>
      </Tabs.Content>

      {/* 연령 탭 */}
      <Tabs.Content value="age" forceMount style={{ display: activeTab === 'age' ? undefined : 'none' }}>
        <motion.div
          key="age"
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: CONTENT_EASE }}
        >
          <AgeInsightCards ageGroups={ageGroups} latest={latest} />
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-card)' }}
          >
            <AgeCompareTab
              regionCode={regionCode}
              currentAgeGroups={ageGroups}
              currentMonth={currentMonth}
              availableMonths={availableMonths}
            />
          </div>
        </motion.div>
      </Tabs.Content>

      {/* 증감 탭 */}
      <Tabs.Content value="change" forceMount style={{ display: activeTab === 'change' ? undefined : 'none' }}>
        <motion.div
          key="change"
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: CONTENT_EASE }}
        >
          <ChangeSummary trend={visibleTrend} />
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--color-bg)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                월별 인구 증감
              </p>
              <RangeToggle value={range} onChange={setRange} />
            </div>
            <ChangeChart data={visibleTrend} />
          </div>
        </motion.div>
      </Tabs.Content>

      {/* 전입출 탭 */}
      <Tabs.Content value="migration" forceMount style={{ display: activeTab === 'migration' ? undefined : 'none' }}>
        <motion.div
          key="migration"
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: CONTENT_EASE }}
        >
          <MigrationTab trend={visibleTrend} />
        </motion.div>
      </Tabs.Content>
    </Tabs.Root>
  )
}

// ── 로컬 범위 토글 ─────────────────────────────────────────────────────────────

function RangeToggle({ value, onChange }: { value: Range; onChange: (v: Range) => void }) {
  return (
    <div
      className="flex gap-0.5 rounded-lg"
      style={{ backgroundColor: 'var(--color-surface)', padding: 3, display: 'inline-flex' }}
    >
      {RANGE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="rounded-md text-[11px] font-semibold"
          style={{
            padding: '3px 9px',
            position: 'relative',
            border: 'none',
            cursor: 'pointer',
            background: 'transparent',
            color: value === opt.value ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            transition: 'color 0.18s',
          }}
        >
          {value === opt.value && (
            <motion.div
              layoutId="rangeBg"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 6,
                backgroundColor: 'var(--color-bg)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                zIndex: 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

// ── 인구추이 테이블 ────────────────────────────────────────────────────────────

function TrendTable({ trend }: { trend: TrendPoint[] }) {
  const rows = [...trend].reverse().slice(0, 6)
  return (
    <table className="w-full text-xs">
      <thead>
        <tr style={{ color: 'var(--color-text-secondary)' }}>
          <th className="py-1 text-left font-medium">기준월</th>
          <th className="py-1 text-right font-medium">인구</th>
          <th className="py-1 text-right font-medium">전월 증감</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(point => (
          <tr key={point.label} style={{ borderTop: '1px solid var(--color-border)' }}>
            <td style={{ padding: '8px 0', color: 'var(--color-text-secondary)' }}>
              {point.label}
            </td>
            <td className="text-right font-medium" style={{ padding: '8px 0', color: 'var(--color-text-primary)' }}>
              {point.population.toLocaleString('ko-KR')}
            </td>
            <td
              className="text-right"
              style={{
                padding: '8px 0',
                color: point.change > 0 ? 'var(--color-positive)'
                  : point.change < 0 ? 'var(--color-negative)'
                  : 'var(--color-neutral)',
              }}
            >
              {point.change !== 0 && (point.change > 0 ? '+' : '')}
              {point.change.toLocaleString('ko-KR')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── 세대 인사이트 ─────────────────────────────────────────────────────────────

function HouseholdInsight({ trend, latest }: { trend: TrendPoint[]; latest: MonthlyStats }) {
  if (trend.length < 2) return null

  const first = trend[0]
  const hhChange = latest.households - first.households
  const hhRate = first.households > 0
    ? ((hhChange / first.households) * 100).toFixed(1)
    : null
  const hhSign = hhChange >= 0 ? '+' : ''

  const sizeLabel =
    latest.householdSize < 2.0 ? '1인·2인 가구 비중이 높은 지역입니다.' :
    latest.householdSize < 2.5 ? '소형 가구 중심 지역입니다.' :
    latest.householdSize < 3.0 ? '중형 가구 비중이 높은 지역입니다.' :
    '대가족 비중이 높은 지역입니다.'

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderLeft: '3px solid var(--color-positive)',
        padding: '12px 16px',
      }}
    >
      <p className="text-[12px] font-semibold" style={{ color: 'var(--color-positive)', marginBottom: 6 }}>
        세대 인사이트
      </p>
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {`표시 기간(${trend.length}개월) 동안 세대수가 ${hhSign}${hhChange.toLocaleString('ko-KR')}세대`}
        {hhRate ? `(${hhSign}${hhRate}%)` : ''}{` 변화했습니다. 현재 세대당 평균 ${latest.householdSize.toFixed(2)}명으로, ${sizeLabel}`}
      </p>
    </div>
  )
}

// ── 증감 요약 ─────────────────────────────────────────────────────────────────

function ChangeSummary({ trend }: { trend: TrendPoint[] }) {
  const changes = trend.filter(p => p.change !== 0).map(p => p.change)
  if (changes.length === 0) return null

  const netChange = changes.reduce((s, c) => s + c, 0)
  const upMonths = changes.filter(c => c > 0).length
  const downMonths = changes.filter(c => c < 0).length

  const items = [
    {
      label: '기간 순증감',
      value: (netChange >= 0 ? '+' : '') + netChange.toLocaleString('ko-KR') + '명',
      color: netChange > 0 ? 'var(--color-positive)' : netChange < 0 ? 'var(--color-negative)' : 'var(--color-text-primary)',
    },
    {
      label: '증가한 달',
      value: `${upMonths}개월`,
      color: upMonths > downMonths ? 'var(--color-positive)' : 'var(--color-text-primary)',
    },
    {
      label: '감소한 달',
      value: `${downMonths}개월`,
      color: downMonths > upMonths ? 'var(--color-negative)' : 'var(--color-text-primary)',
    },
  ]

  return (
    <div className="flex gap-2" style={{ marginBottom: 12 }}>
      {items.map(item => (
        <div
          key={item.label}
          className="flex-1 rounded-xl"
          style={{ backgroundColor: 'var(--color-surface)', padding: '12px 10px' }}
        >
          <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            {item.label}
          </p>
          <p className="text-[15px] font-bold" style={{ color: item.color, lineHeight: 1.2 }}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
