'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import SouthKorea from '@svg-maps/south-korea'
import type { SidoStat } from '@/lib/data'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const ID_TO_SIDO: Record<string, string> = {
  'seoul':               '서울특별시',
  'busan':               '부산광역시',
  'daegu':               '대구광역시',
  'incheon':             '인천광역시',
  'gwangju':             '광주광역시',
  'daejeon':             '대전광역시',
  'ulsan':               '울산광역시',
  'sejong':              '세종특별자치시',
  'gyeonggi':            '경기도',
  'gangwon':             '강원특별자치도',
  'north-chungcheong':   '충청북도',
  'south-chungcheong':   '충청남도',
  'north-jeolla':        '전북특별자치도',
  'south-jeolla':        '전라남도',
  'north-gyeongsang':    '경상북도',
  'south-gyeongsang':    '경상남도',
  'jeju':                '제주특별자치도',
}

function interpolateHex(from: string, to: string, t: number): string {
  const f = parseInt(from.slice(1), 16)
  const tv = parseInt(to.slice(1), 16)
  const r = Math.round(((f >> 16) & 0xff) * (1 - t) + ((tv >> 16) & 0xff) * t)
  const g = Math.round(((f >> 8) & 0xff) * (1 - t) + ((tv >> 8) & 0xff) * t)
  const b = Math.round((f & 0xff) * (1 - t) + (tv & 0xff) * t)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function rateToFill(rate: number): string {
  if (rate > 0) {
    const t = Math.min(rate / 0.025, 1)
    return interpolateHex('#dbeafe', '#1d4ed8', t)
  } else if (rate < 0) {
    const t = Math.min(-rate / 0.025, 1)
    return interpolateHex('#fee2e2', '#dc2626', t)
  }
  return '#e5e7eb'
}

interface Props {
  sidoStats: SidoStat[]
}

export function KoreaHeatmap({ sidoStats }: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const statsMap = new Map(sidoStats.map(s => [s.sido, s]))
  const selectedSido = selectedId ? ID_TO_SIDO[selectedId] : null
  const selectedStat = selectedSido ? statsMap.get(selectedSido) : null

  function handleClick(id: string) {
    setSelectedId(prev => prev === id ? null : id)
  }

  const changeRate = selectedStat?.changeRate ?? 0
  const changeColor =
    changeRate > 0 ? 'var(--color-positive)' :
    changeRate < 0 ? 'var(--color-negative)' :
    'var(--color-neutral)'

  return (
    <div>
      {/* 지도 */}
      <div style={{ position: 'relative', width: '100%' }}>
        <svg
          viewBox={SouthKorea.viewBox}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="대한민국 시도별 인구 지도"
        >
          {SouthKorea.locations.map((loc) => {
            const sido = ID_TO_SIDO[loc.id]
            const stat = sido ? statsMap.get(sido) : undefined
            const fill = stat ? rateToFill(stat.changeRate) : '#e5e7eb'
            const isSelected = selectedId === loc.id

            return (
              <motion.path
                key={loc.id}
                d={loc.path}
                fill={fill}
                stroke={isSelected ? 'var(--color-accent)' : '#ffffff'}
                strokeWidth={isSelected ? 2 : 0.8}
                style={{ cursor: 'pointer' }}
                animate={{
                  opacity: selectedId && !isSelected ? 0.55 : 1,
                  strokeWidth: isSelected ? 2 : 0.8,
                }}
                whileHover={{ opacity: selectedId && !isSelected ? 0.7 : 0.88 }}
                whileTap={{ opacity: 0.6 }}
                transition={{ duration: 0.18, ease: EASE }}
                onClick={() => handleClick(loc.id)}
                aria-label={sido ?? loc.name}
              />
            )
          })}
        </svg>
      </div>

      {/* 선택 지역 패널 */}
      <div
        style={{
          minHeight: 90,
          borderRadius: 14,
          border: '1px solid var(--color-border)',
          backgroundColor: selectedStat ? 'var(--color-bg)' : 'var(--color-surface)',
          marginTop: 12,
          overflow: 'hidden',
          transition: 'background-color 0.2s',
        }}
      >
        <AnimatePresence mode="wait">
          {selectedStat && selectedSido ? (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              style={{ padding: '16px 16px 14px' }}
            >
              {/* 지역명 + 전년비 뱃지 */}
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <p className="text-[17px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedSido}
                </p>
                <span
                  className="text-[12px] font-bold rounded-full"
                  style={{
                    color: changeColor,
                    backgroundColor: changeRate > 0
                      ? 'var(--color-positive-light)'
                      : changeRate < 0
                        ? 'var(--color-negative-light)'
                        : 'var(--color-surface)',
                    padding: '3px 10px',
                  }}
                >
                  {changeRate > 0 ? '▲' : changeRate < 0 ? '▼' : '—'}{' '}
                  {Math.abs(changeRate * 100).toFixed(2)}%
                </span>
              </div>

              {/* 인구 카운트업 */}
              <div style={{ marginBottom: 14 }}>
                <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}>
                  총인구 (전년비 기준)
                </p>
                <p
                  className="text-[24px] font-extrabold"
                  style={{
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <AnimatedNumber
                    value={selectedStat.population}
                    formatter={(n) => n.toLocaleString('ko-KR')}
                    duration={0.7}
                  />
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--color-text-secondary)', marginLeft: 3 }}>명</span>
                </p>
              </div>

              {/* 순위 보기 버튼 */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                onClick={() => router.push(`/ranking?sido=${encodeURIComponent(selectedSido)}`)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '11px 0',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                }}
              >
                {selectedSido} 시군구 순위 보기
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                padding: '18px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {/* 핀 아이콘 pulse */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ flexShrink: 0 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </motion.div>
              <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                시도를 탭하면<br />
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>인구 현황과 시군구 순위</span>를 확인할 수 있어요
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 범례 */}
      <div
        style={{
          marginTop: 12,
          padding: '10px 14px',
          borderRadius: 10,
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div className="flex items-center gap-2">
          {/* 감소 레이블 */}
          <span className="text-[10px] font-semibold" style={{ color: '#dc2626', whiteSpace: 'nowrap' }}>
            −2.5%↑
          </span>
          {/* 감소 그라디언트 */}
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'linear-gradient(to right, #dc2626, #fee2e2)' }} />
          {/* 중립 */}
          <div style={{ width: 20, height: 8, borderRadius: 4, backgroundColor: '#e5e7eb', flexShrink: 0 }} />
          <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}>0</span>
          <div style={{ width: 20, height: 8, borderRadius: 4, backgroundColor: '#e5e7eb', flexShrink: 0 }} />
          {/* 증가 그라디언트 */}
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'linear-gradient(to right, #dbeafe, #1d4ed8)' }} />
          {/* 증가 레이블 */}
          <span className="text-[10px] font-semibold" style={{ color: '#1d4ed8', whiteSpace: 'nowrap' }}>
            +2.5%↑
          </span>
        </div>
        <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)', marginTop: 5, textAlign: 'center' }}>
          전년 동월 대비 인구 변화율
        </p>
      </div>
    </div>
  )
}
