/**
 * 월간 리포트 테스트 (docs/backlog.md N-5)
 *
 * 두 가지를 지킨다.
 *   ① 수치가 다른 화면과 어긋나지 않는다 (principles.md B1)
 *   ② 매달 같은 문장이 나오지 않는다 — 그러면 자동 생성 템플릿이다 (B2)
 */
import { describe, it, expect } from 'vitest'
import {
  buildMonthlyReport,
  getReportMonths,
  ymToSlug,
  slugToYm,
  formatYmLabel,
} from './monthly-report'
import { getAvailableMonths, getAllRegionRankings, getNationalSummary } from './data'

const reports = getReportMonths().map(ym => buildMonthlyReport(ym)!)

describe('생성', () => {
  it('첫 달을 제외한 모든 월에서 생성된다', () => {
    const months = getAvailableMonths()
    expect(getReportMonths()).toEqual(months.slice(1))
    expect(reports.every(Boolean)).toBe(true)
  })

  it('첫 달과 없는 월은 null 이다 — 전월 대비가 리포트의 뼈대다', () => {
    expect(buildMonthlyReport(getAvailableMonths()[0])).toBeNull()
    expect(buildMonthlyReport('209912')).toBeNull()
  })

  it('slug 변환이 왕복한다', () => {
    expect(ymToSlug('202607')).toBe('2026-07')
    expect(slugToYm('2026-07')).toBe('202607')
    expect(slugToYm('2026-7')).toBeNull()
    expect(slugToYm('아무거나')).toBeNull()
    expect(formatYmLabel('202607')).toBe('2026년 7월')
  })
})

describe('수치 정합성', () => {
  it('전국 인구가 순위표 합계와 일치한다', () => {
    // 비교 가능한 지역만 더하면 신설 지역이 빠져 홈·순위와 어긋난다.
    // 2026.07 인천 개편에서 실제로 90만 명 차이가 났다.
    for (const r of reports) {
      const fromRankings = getAllRegionRankings(r.ym).reduce((s, e) => s + e.population, 0)
      expect(r.national.population, r.label).toBe(fromRankings)
    }
  })

  it('최신월 리포트가 홈의 전국 총인구와 같다', () => {
    const summary = getNationalSummary()!
    const latest = reports[reports.length - 1]
    expect(latest.ym).toBe(summary.month)
    expect(latest.national.population).toBe(summary.totalPopulation)
  })

  it('집계 지역 수 ≥ 비교 가능 지역 수', () => {
    for (const r of reports) {
      expect(r.national.regionCount, r.label).toBeGreaterThanOrEqual(r.national.comparableCount)
      expect(r.national.gainerCount + r.national.loserCount)
        .toBeLessThanOrEqual(r.national.comparableCount)
    }
  })

  it('시도 증감의 합이 비교 가능 지역의 증감 합과 같다', () => {
    for (const r of reports) {
      const sidoSum = r.sidos.reduce((s, x) => s + x.change, 0)
      const sidoRegions = r.sidos.reduce((s, x) => s + x.regionCount, 0)
      expect(sidoRegions, r.label).toBe(r.national.comparableCount)
      // 시도 합계는 비교 가능 지역 기준이라 national.change(전체 기준)와 다를 수 있다.
      // 개편이 없는 달에는 같아야 한다.
      if (r.reorg.created.length === 0 && r.reorg.retired.length === 0) {
        expect(sidoSum, r.label).toBe(r.national.change)
      }
    }
  })

  it('상위 목록이 실제로 정렬되어 있다', () => {
    for (const r of reports) {
      const g = r.gainers.map(x => x.change)
      expect([...g], r.label).toEqual([...g].sort((a, b) => b - a))
      const l = r.losers.map(x => x.change)
      expect([...l], r.label).toEqual([...l].sort((a, b) => a - b))
      const fg = r.fastestGrowth.map(x => x.rate)
      expect([...fg], r.label).toEqual([...fg].sort((a, b) => b - a))
    }
  })
})

describe('행정구역 개편 감지', () => {
  it('2026.07 인천 분할을 잡는다', () => {
    const r = buildMonthlyReport('202607')!
    expect(r.reorg.retired.map(x => x.sigungu).sort()).toEqual(['동구', '서구', '중구'])
    expect(r.reorg.created.map(x => x.sigungu).sort())
      .toEqual(['검단구', '서해구', '영종구', '제물포구'])
  })

  it('개편이 없는 달에는 비어 있다', () => {
    const r = buildMonthlyReport('202605')!
    expect(r.reorg.created).toEqual([])
    expect(r.reorg.retired).toEqual([])
  })

  it('개편이 있는 달에만 개편 문단이 붙는다', () => {
    for (const r of reports) {
      const hasReorg = r.reorg.created.length > 0 || r.reorg.retired.length > 0
      const hasParagraph = r.paragraphs.some(p => p.includes('행정구역 개편이 있었습니다'))
      expect(hasParagraph, r.label).toBe(hasReorg)
    }
  })
})

describe('서술 — 고정 템플릿이 아님', () => {
  it('헤드라인이 한 종류로 쏠리지 않는다', () => {
    const counts = new Map<string, number>()
    for (const r of reports) {
      const shape = r.headline.replace(/[0-9,.%]+/g, '#')
      counts.set(shape, (counts.get(shape) ?? 0) + 1)
    }
    expect(counts.size).toBeGreaterThanOrEqual(4)
    expect(Math.max(...counts.values()) / reports.length).toBeLessThan(0.5)
  })

  it('달마다 본문이 다르다', () => {
    const bodies = new Set(reports.map(r => r.paragraphs.join('')))
    expect(bodies.size).toBe(reports.length)
  })

  it('모든 리포트가 최소 3문단을 갖는다', () => {
    for (const r of reports) {
      expect(r.paragraphs.length, r.label).toBeGreaterThanOrEqual(3)
      expect(r.paragraphs.every(p => p.trim().length > 0)).toBe(true)
    }
  })

  it('실제 수치가 문장에 들어간다', () => {
    for (const r of reports) {
      expect(r.paragraphs[0]).toContain(r.national.population.toLocaleString('ko-KR'))
      expect(r.paragraphs[0]).toContain(r.label)
    }
  })
})

describe('한국어 조사', () => {
  it('받침에 맞지 않는 조사가 없다', () => {
    // '의왕시으로'·'검단구이(가)' 같은 표기를 막는다
    const bad = [/시으로/, /구으로/, /군으로\b(?!.)/, /이\(가\)/, /은\(는\)/, /을\(를\)/]
    for (const r of reports) {
      const all = [r.headline, ...r.paragraphs].join(' ')
      for (const re of bad) {
        expect(re.test(all), `${r.label}: ${re} — ${all.slice(0, 120)}`).toBe(false)
      }
    }
  })

  it('부호와 방향 서술이 중복되지 않는다', () => {
    // '-3,716명 줄었습니다' 처럼 읽히면 안 된다
    for (const r of reports) {
      expect(/-[\d,]+명 (줄|늘)/.test(r.headline), r.label).toBe(false)
    }
  })
})
