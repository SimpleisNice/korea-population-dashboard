'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SouthKorea from '@svg-maps/south-korea'
import type { SidoStat } from '@/lib/data'
import { formatNumber } from '@/lib/utils'

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
    if (selectedId === id) {
      const sido = ID_TO_SIDO[id]
      if (sido) router.push(`/ranking?sido=${encodeURIComponent(sido)}`)
    } else {
      setSelectedId(id)
    }
  }

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
              <path
                key={loc.id}
                d={loc.path}
                fill={fill}
                stroke={isSelected ? 'var(--color-accent)' : '#ffffff'}
                strokeWidth={isSelected ? 2 : 0.8}
                style={{ cursor: 'pointer', transition: 'opacity 150ms' }}
                opacity={selectedId && !isSelected ? 0.65 : 1}
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
          minHeight: 80,
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          backgroundColor: selectedStat ? 'var(--color-bg)' : 'var(--color-surface)',
          padding: '14px 16px',
          marginTop: 12,
          transition: 'background-color 200ms',
        }}
      >
        {selectedStat && selectedSido ? (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <p className="text-[15px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {selectedSido}
              </p>
              <button
                onClick={() => router.push(`/ranking?sido=${encodeURIComponent(selectedSido)}`)}
                className="rounded-full text-[12px] font-semibold"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: '#fff',
                  padding: '4px 12px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                순위 보기
              </button>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}>
                  총인구
                </p>
                <p className="text-[14px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatNumber(selectedStat.population)}명
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}>
                  전년비
                </p>
                <p
                  className="text-[14px] font-bold"
                  style={{
                    color:
                      selectedStat.changeRate > 0
                        ? 'var(--color-positive)'
                        : selectedStat.changeRate < 0
                          ? 'var(--color-negative)'
                          : 'var(--color-neutral)',
                  }}
                >
                  {selectedStat.changeRate > 0 ? '▲' : selectedStat.changeRate < 0 ? '▼' : '—'}{' '}
                  {Math.abs(selectedStat.changeRate * 100).toFixed(2)}%
                </p>
              </div>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>
              탭을 한 번 더 누르면 순위 페이지로 이동합니다
            </p>
          </div>
        ) : (
          <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
            시도를 탭하면 인구 현황을 확인할 수 있습니다
          </p>
        )}
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 60, height: 8, borderRadius: 4, background: 'linear-gradient(to right, #dc2626, #fee2e2)' }} />
          <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>감소</span>
        </div>
        <div
          style={{
            width: 32,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#e5e7eb',
          }}
        />
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>증가</span>
          <div style={{ width: 60, height: 8, borderRadius: 4, background: 'linear-gradient(to right, #dbeafe, #1d4ed8)' }} />
        </div>
      </div>
    </div>
  )
}
