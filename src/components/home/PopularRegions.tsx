'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { Region } from '@/lib/types'
import { regionPath } from '@/lib/utils'

type Tab = 'growth' | 'decline' | 'aging'

const TABS: { key: Tab; label: string; subtitle: string }[] = [
  { key: 'growth',  label: '인구 급증', subtitle: '최근 12개월 인구 증가율 TOP' },
  { key: 'decline', label: '인구 급감', subtitle: '최근 12개월 인구 감소율 TOP' },
  { key: 'aging',   label: '고령화',    subtitle: '고령화 지수 최고 지역 TOP' },
]

interface RegionWithRate {
  region: Region
  rate: number
}

interface Props {
  growthRegions:  RegionWithRate[]
  declineRegions: RegionWithRate[]
  agingRegions:   RegionWithRate[]
}

function formatRate(tab: Tab, rate: number): string {
  if (tab === 'aging') return `${Math.round(rate)}`
  return `${(Math.abs(rate) * 100).toFixed(1)}%`
}

function getRateColor(tab: Tab): string {
  if (tab === 'aging')   return 'var(--color-neutral)'
  if (tab === 'growth')  return 'var(--color-positive)'
  return 'var(--color-negative)'
}

function getRatePrefix(tab: Tab): string {
  if (tab === 'aging')   return ''
  if (tab === 'growth')  return '▲ '
  return '▼ '
}

function getRankColor(rank: number): string {
  if (rank === 1) return 'var(--color-accent)'
  if (rank === 2) return '#7c3aed'
  if (rank === 3) return '#d97706'
  return 'var(--color-text-secondary)'
}

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055 },
  },
  exit: {},
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.15 } },
}

export function PopularRegions({ growthRegions, declineRegions, agingRegions }: Props) {
  const [tab, setTab]  = useState<Tab>('growth')
  const prevTabIndex   = useRef(0)
  const [direction, setDirection] = useState(1)

  const regionMap: Record<Tab, RegionWithRate[]> = {
    growth: growthRegions,
    decline: declineRegions,
    aging: agingRegions,
  }

  const current   = TABS.find(t => t.key === tab)!
  const regions   = regionMap[tab]
  const maxRate   = Math.max(...regions.map(r => Math.abs(r.rate)), 0.001)
  const rateColor = getRateColor(tab)

  function switchTab(next: Tab) {
    if (next === tab) return
    const nextIdx = TABS.findIndex(t => t.key === next)
    const curIdx  = TABS.findIndex(t => t.key === tab)
    setDirection(nextIdx > curIdx ? 1 : -1)
    prevTabIndex.current = curIdx
    setTab(next)
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 24, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.25, ease: EASE } },
    exit:   (dir: number) => ({ x: dir * -16, opacity: 0, transition: { duration: 0.18 } }),
  }

  return (
    <section>
      {/* 탭 헤더 */}
      <div style={{ marginBottom: 14 }}>
        <div
          className="flex items-center gap-1"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 12,
            padding: 4,
            marginBottom: 8,
            width: 'fit-content',
            position: 'relative',
          }}
        >
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              style={{
                position: 'relative',
                padding: '6px 14px',
                border: 'none',
                cursor: 'pointer',
                background: 'transparent',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: tab === t.key ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                transition: 'color 0.2s ease',
                zIndex: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {tab === t.key && (
                <motion.div
                  layoutId="tabBg"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 8,
                    backgroundColor: 'var(--color-bg)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              {t.label}
            </button>
          ))}
        </div>
        <span
          className="text-[11px]"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.55 }}
        >
          {current.subtitle} · 시도별 1곳
        </span>
      </div>

      {/* 랭킹 카드 리스트 */}
      <div
        className="overflow-hidden rounded-xl"
        style={{
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="show"
              style={{ listStyle: 'none', margin: 0, padding: 0 }}
            >
              {regions.map(({ region, rate }, i) => {
                const barWidth = (Math.abs(rate) / maxRate) * 100
                return (
                  <motion.li key={region.code} variants={itemVariants}>
                    <Link
                      href={regionPath(region.sido, region.sigungu)}
                      style={{
                        display: 'block',
                        padding: '12px 16px 11px',
                        borderBottom: i < regions.length - 1 ? '1px solid var(--color-border)' : 'none',
                        textDecoration: 'none',
                      }}
                      className="group"
                    >
                      {/* 상단 행: 순위 + 지역명 + 수치 + 화살표 */}
                      <div className="flex items-center" style={{ gap: 10, marginBottom: 7 }}>
                        {/* 순위 번호 */}
                        <span
                          style={{
                            width: 20,
                            flexShrink: 0,
                            fontSize: 13,
                            fontWeight: 800,
                            color: getRankColor(i + 1),
                            lineHeight: 1,
                          }}
                        >
                          {i + 1}
                        </span>

                        {/* 지역명 + 시도 */}
                        <div className="flex-1 min-w-0">
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            {region.sigungu}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: 'var(--color-text-secondary)',
                              marginLeft: 5,
                            }}
                          >
                            {region.sido}
                          </span>
                        </div>

                        {/* 수치 배지 */}
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: rateColor,
                            flexShrink: 0,
                          }}
                        >
                          {getRatePrefix(tab)}{formatRate(tab, rate)}
                          {tab === 'aging' && (
                            <span style={{ fontSize: 10, fontWeight: 500, marginLeft: 2 }}>
                              (고령화지수)
                            </span>
                          )}
                        </span>

                        {/* 이동 화살표 */}
                        <motion.div
                          style={{ flexShrink: 0, color: 'var(--color-border)' }}
                          whileHover={{ x: 2 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className="group-hover:text-[var(--color-accent)]"
                        >
                          <ChevronRight size={15} />
                        </motion.div>
                      </div>

                      {/* Rate 바 */}
                      <div style={{ paddingLeft: 30 }}>
                        <div
                          style={{
                            height: 3,
                            borderRadius: 99,
                            backgroundColor: 'var(--color-surface)',
                            overflow: 'hidden',
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.6, delay: i * 0.055, ease: [0.25, 0.46, 0.45, 0.94] }}
                            style={{
                              height: '100%',
                              borderRadius: 99,
                              backgroundColor: rateColor,
                              opacity: 0.7,
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                )
              })}
              {regions.length === 0 && (
                <li style={{ padding: '20px 16px' }}>
                  <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                    데이터를 불러오는 중입니다.
                  </p>
                </li>
              )}
            </motion.ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
