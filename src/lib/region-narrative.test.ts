/**
 * 지역 서술 생성기 테스트
 *
 * 가장 중요한 검증은 "지역마다 실제로 달라지는가"다.
 * 모든 지역이 같은 문장을 받으면 그건 고정 템플릿이고,
 * AdSense 가 "자동 생성 콘텐츠"로 판정하는 바로 그 패턴이 된다 (docs/principles.md B2).
 */
import fs from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'
import { buildRegionNarrative } from './region-narrative'
import { getTopLevelRegions, getAvailableMonths, getRegionDetail, getRegionRank } from './data'

const REGIONS_DIR = path.join(process.cwd(), 'public', 'data', 'regions')

function narrativeFor(code: string) {
  const ym = getAvailableMonths().at(-1)!
  const detail = getRegionDetail(code, ym, 12)!
  return buildRegionNarrative({
    sigunguName: detail.region.sigungu,
    sidoName: detail.region.sido,
    ym,
    latest: detail.latest,
    yoyMonth: detail.yoyMonth,
    trend: detail.trend,
    ageGroups: detail.ageGroups,
    rank: getRegionRank(code, ym),
  })
}

describe('서술 생성', () => {
  it('모든 최상위 시군구에서 오류 없이 생성된다', () => {
    for (const r of getTopLevelRegions()) {
      const n = narrativeFor(r.code)
      expect(n.paragraphs.length, `${r.sigungu}`).toBeGreaterThanOrEqual(4)
      expect(n.paragraphs.every(p => p.trim().length > 0)).toBe(true)
    }
  })

  it('판정과 문단에 지역명·실제 수치가 들어간다', () => {
    const jongno = getTopLevelRegions().find(r => r.sigungu === '종로구')!
    const n = narrativeFor(jongno.code)
    expect(n.paragraphs[0]).toContain('종로구')
    // 첫 문단에 실제 인구 수가 콤마 포맷으로 들어간다
    expect(n.paragraphs[0]).toMatch(/\d{1,3}(,\d{3})+명/)
    expect(n.verdict).not.toBeNull()
  })
})

describe('지역별 다양성 — 고정 템플릿이 아님', () => {
  const sample = getTopLevelRegions()
  const narratives = sample.map(r => ({ region: r, n: narrativeFor(r.code) }))

  it('판정 문구가 한 종류로 쏠리지 않는다', () => {
    const counts = new Map<string, number>()
    for (const { n } of narratives) {
      const h = n.verdict?.headline ?? '(없음)'
      counts.set(h, (counts.get(h) ?? 0) + 1)
    }
    // 최소 3종류 이상이 실제로 사용되어야 한다
    expect(counts.size).toBeGreaterThanOrEqual(3)
    // 어떤 판정도 전체의 85% 를 넘지 않는다
    const max = Math.max(...counts.values())
    expect(max / narratives.length).toBeLessThan(0.85)
  })

  it('세대 분화 문단이 한 문장으로 쏠리지 않는다', () => {
    // 이전 임계값(±2)에서는 229개 중 225개가 같은 문장을 받았다.
    const counts = new Map<string, number>()
    for (const { n } of narratives) {
      const para = n.paragraphs.find(p => p.includes('세대수가 인구보다') || p.includes('인구가 세대수보다'))
      const key = para?.slice(para.indexOf('%포인트') + 4, para.indexOf('%포인트') + 24) ?? '(없음)'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    const max = Math.max(...counts.values())
    expect(counts.size).toBeGreaterThanOrEqual(3)
    expect(max / narratives.length).toBeLessThan(0.7)
  })

  it('연령 문단의 해석이 지역 구조에 따라 갈린다', () => {
    const readings = new Set<string>()
    for (const { n } of narratives) {
      const para = n.paragraphs.find(p => p.includes('연령 구성을 보면'))
      if (para) readings.add(para.slice(para.indexOf('입니다.') + 4).trim().slice(0, 20))
    }
    expect(readings.size).toBeGreaterThanOrEqual(3)
  })

  it('서로 다른 지역은 서로 다른 본문을 갖는다', () => {
    const bodies = new Set(narratives.map(({ n }) => n.paragraphs.join('')))
    // 완전히 동일한 본문이 나오면 안 된다
    expect(bodies.size).toBe(narratives.length)
  })
})

describe('수치 정확성', () => {
  it('연령 구성비 합이 100%에 가깝다', () => {
    for (const r of getTopLevelRegions().slice(0, 30)) {
      const n = narrativeFor(r.code)
      const para = n.paragraphs.find(p => p.includes('연령 구성을 보면'))
      if (!para) continue
      const nums = [...para.matchAll(/(\d+\.\d)%/g)].map(m => parseFloat(m[1]))
      expect(nums.length).toBe(3)
      const sum = nums.reduce((a, b) => a + b, 0)
      expect(Math.abs(sum - 100), `${r.sigungu}: ${sum}`).toBeLessThan(0.5)
    }
  })

  it('첫 문단의 인구 수가 실제 데이터와 일치한다', () => {
    const ym = getAvailableMonths().at(-1)!
    for (const r of getTopLevelRegions().slice(0, 20)) {
      const n = narrativeFor(r.code)
      const json = JSON.parse(
        fs.readFileSync(path.join(REGIONS_DIR, `${r.code}.json`), 'utf-8'),
      ) as { months: Record<string, { population: number }> }
      expect(n.paragraphs[0]).toContain(json.months[ym].population.toLocaleString('ko-KR'))
    }
  })
})
