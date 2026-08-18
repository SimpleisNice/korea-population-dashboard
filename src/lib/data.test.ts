/**
 * 데이터 파이프라인 회귀 테스트
 *
 * 여기서 지키려는 것은 2026-08 실사에서 발견된 결함들이 다시 들어오지 않는 것이다.
 * 각 테스트는 `docs/spec.md` §5 의 결함 번호에 대응한다.
 *
 * 빌드 산출물(public/data/regions)을 대상으로 하므로 `npm run build-data` 가 선행되어야 한다.
 */
import fs from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'
import {
  getAllRegions,
  getTopLevelRegions,
  getAvailableMonths,
  getAllRegionRankings,
  getNationalSummary,
  getSidoStats,
  getChildDistricts,
  getRegionBySlug,
  getRegionDetail,
} from './data'
import {
  decodeCSV,
  splitCSVLine,
  parseRegionCell,
  parseNum,
  isSidoRow,
  classifyRawFile,
} from '../../scripts/lib/mois-csv'
import { SVG_ID_TO_SIDO } from './sido-map'

const REGIONS_DIR = path.join(process.cwd(), 'public', 'data', 'regions')
const RAW_DIR = path.join(process.cwd(), 'data', 'raw')

// ── MOIS 공식 합계 (독립 검증 기준값) ────────────────────────────────────────
// 원본 CSV 에는 코드가 00000000 으로 끝나는 시도 합계 행이 들어 있다.
// MOIS 가 직접 집계한 값이므로, 우리가 시군구를 더한 값과 대조하면 독립 검증이 된다
// (docs/principles.md A3-1). D1(일반구 이중 계상, 전국 총인구 +20.6%)을 잡는 테스트다.
//
// 파서와 같은 모듈을 쓰지 않고 여기서 직접 읽는다 — 파서 버그가 기준값까지 함께
// 오염시키면 대조가 무의미해진다.

/** 해당 연월의 시도 합계 행을 모두 더한다. 그 달이 원본에 없으면 null. */
function officialNationalTotal(ym: string): number | null {
  const files = fs.readdirSync(RAW_DIR).filter(f => classifyRawFile(f) === 'population')
  const header = `${ym.slice(0, 4)}년${ym.slice(4)}월_거주자 인구수`

  for (const file of files) {
    const text = decodeCSV(fs.readFileSync(path.join(RAW_DIR, file)))
    const lines = text.split(/\r?\n/).filter(l => l.trim())
    const col = splitCSVLine(lines[0]).findIndex(h => h.normalize('NFC') === header)
    if (col < 0) continue

    let sum = 0
    let found = 0
    for (const line of lines.slice(1)) {
      const cells = splitCSVLine(line)
      const region = parseRegionCell(cells[0] ?? '')
      if (!region || !isSidoRow(region.code)) continue
      sum += parseNum(cells[col]) ?? 0
      found++
    }
    return found > 0 ? sum : null
  }
  return null
}

describe('빌드 산출물', () => {
  it('index.json 의 모든 지역이 실제 JSON 파일을 가진다 (D5)', () => {
    const files = new Set(
      fs.readdirSync(REGIONS_DIR).filter(f => f !== 'index.json').map(f => f.replace('.json', '')),
    )
    const missing = getAllRegions().filter(r => !files.has(r.code))
    expect(missing.map(r => `${r.sido} ${r.sigungu}`)).toEqual([])
  })

  it('고아 JSON 파일이 없다 — build-data 가 출력 디렉터리를 비운다 (D8)', () => {
    const codes = new Set(getAllRegions().map(r => r.code))
    const orphans = fs.readdirSync(REGIONS_DIR)
      .filter(f => f !== 'index.json')
      .map(f => f.replace('.json', ''))
      .filter(c => !codes.has(c))
    expect(orphans).toEqual([])
  })

  it('모든 지역이 라우팅 가능한 sigungu 를 가진다 (D4 — 세종)', () => {
    const empty = getAllRegions().filter(r => !r.sigungu.trim())
    expect(empty.map(r => r.code)).toEqual([])
    // 세종특별자치시는 하위 시군구가 없어 시도명으로 채워진다
    expect(getRegionBySlug('세종특별자치시', '세종특별자치시')).not.toBeNull()
  })
})

describe('행정 계층 (level)', () => {
  it('최상위 시군구와 일반구의 합이 전체와 일치한다', () => {
    const all = getAllRegions()
    const top = getTopLevelRegions()
    const districts = all.filter(r => r.level === 'district')
    expect(top.length + districts.length).toBe(all.length)
    expect(top.length).toBeGreaterThan(0)
  })

  it('일반구는 부모 시가 목록에 존재하고 이름이 부모명으로 시작한다', () => {
    const byCode = new Map(getAllRegions().map(r => [r.code, r]))
    for (const d of getAllRegions().filter(r => r.level === 'district')) {
      const parent = byCode.get(`${d.code.slice(0, 4)}000000`)
      expect(parent, `${d.sigungu} 의 부모 시가 없다`).toBeDefined()
      expect(d.sigungu.startsWith(`${parent!.sigungu} `)).toBe(true)
      expect(parent!.level).toBe('sigungu')
    }
  })

  it('코드 앞자리만 겹치는 별개 지역을 일반구로 오분류하지 않는다', () => {
    // 영동군(4374000000)과 증평군(4374500000)은 앞 4자리가 같지만 무관한 지역이다
    const jeungpyeong = getAllRegions().find(r => r.code === '4374500000')
    expect(jeungpyeong?.sigungu).toBe('증평군')
    expect(jeungpyeong?.level).toBe('sigungu')
  })
})

describe('집계 정합성 (D1 — 이중 계상 방지)', () => {
  it('전국 총인구가 MOIS 공식 합계와 1% 이내로 일치한다', () => {
    const summary = getNationalSummary()
    expect(summary).not.toBeNull()

    const official = officialNationalTotal(summary!.month)
    expect(official, `${summary!.month} 공식 합계를 원본 CSV에서 찾지 못했다`).not.toBeNull()

    const diff = Math.abs(summary!.totalPopulation / official! - 1)
    expect(
      diff,
      `전국 총인구 ${summary!.totalPopulation.toLocaleString()} vs 공식 ${official!.toLocaleString()}`,
    ).toBeLessThan(0.01)
  })

  it('시도 합계의 총합이 전국 총인구와 일치한다', () => {
    const summary = getNationalSummary()
    const sidoTotal = getSidoStats().reduce((s, x) => s + x.population, 0)
    expect(sidoTotal).toBe(summary!.totalPopulation)
  })

  it('일반구를 더하면 전국 합계가 부풀려진다 — 제외가 의미 있음을 확인', () => {
    const districts = getAllRegions().filter(r => r.level === 'district')
    // 일반구가 존재하는 한, 이들을 포함한 합계는 반드시 더 커진다.
    // 이 테스트가 깨지면 level 판별이 무력화된 것이다.
    expect(districts.length).toBeGreaterThan(0)
  })
})

describe('순위 (D2·D3·D13)', () => {
  const latestYm = getAvailableMonths().at(-1)!

  it('순위표에 일반구가 포함되지 않는다', () => {
    const entries = getAllRegionRankings(latestYm)
    const districts = entries.filter(e => e.region.level === 'district')
    expect(districts.map(e => e.region.sigungu)).toEqual([])
  })

  it('nationalTotal 이 실제 순위 대상 수와 일치한다', () => {
    const entries = getAllRegionRankings(latestYm)
    expect(entries.length).toBeGreaterThan(0)
    for (const e of entries) {
      expect(e.rank.nationalTotal).toBe(entries.length)
    }
  })

  it('부모 시와 그 산하 일반구가 같은 순위표에 함께 등장하지 않는다', () => {
    const names = new Set(getAllRegionRankings(latestYm).map(e => `${e.region.sido} ${e.region.sigungu}`))
    for (const d of getAllRegions().filter(r => r.level === 'district')) {
      expect(names.has(`${d.sido} ${d.sigungu}`)).toBe(false)
    }
  })

  it('기준월 데이터가 없는 지역은 과거 값으로 폴백되지 않는다', () => {
    // 순위에 오른 모든 지역은 기준월 데이터를 실제로 갖고 있어야 한다
    for (const e of getAllRegionRankings(latestYm)) {
      const json = JSON.parse(
        fs.readFileSync(path.join(REGIONS_DIR, `${e.region.code}.json`), 'utf-8'),
      ) as { months: Record<string, { population: number }> }
      expect(json.months[latestYm], `${e.region.sigungu} 가 ${latestYm} 없이 순위에 있다`).toBeDefined()
      expect(json.months[latestYm].population).toBe(e.population)
    }
  })
})

describe('시계열 연속성 (D12 — 행정구역 개편)', () => {
  const months = getAvailableMonths()

  it.each([
    ['5111000000', '춘천시 (강원 42xx→51xx, 2023.06)'],
    ['5211000000', '전주시 (전북 45xx→52xx, 2024.01)'],
    ['2772000000', '군위군 (경북→대구, 2023.07)'],
  ])('%s %s 의 시계열이 개편 시점에 끊기지 않는다', (code) => {
    const json = JSON.parse(
      fs.readFileSync(path.join(REGIONS_DIR, `${code}.json`), 'utf-8'),
    ) as { months: Record<string, unknown> }
    const keys = Object.keys(json.months).sort()
    expect(keys[0]).toBe(months[0])
    expect(keys.at(-1)).toBe(months.at(-1))
  })

  it('개편 전 구 코드 지역이 유령으로 남아 있지 않다', () => {
    const legacy = ['4211000000', '4511000000', '4772000000']
    for (const code of legacy) {
      expect(fs.existsSync(path.join(REGIONS_DIR, `${code}.json`)), `${code} 잔존`).toBe(false)
    }
  })
})

describe('연월 목록 (D11)', () => {
  it('한 지역이 아니라 전체 시군구의 합집합을 쓴다', () => {
    const months = getAvailableMonths()
    expect(months.length).toBeGreaterThan(0)
    expect([...months]).toEqual([...months].sort())

    // 어떤 지역도 목록에 없는 월을 갖지 않는다
    const known = new Set(months)
    for (const r of getTopLevelRegions().slice(0, 20)) {
      const json = JSON.parse(
        fs.readFileSync(path.join(REGIONS_DIR, `${r.code}.json`), 'utf-8'),
      ) as { months: Record<string, unknown> }
      for (const ym of Object.keys(json.months)) expect(known.has(ym)).toBe(true)
    }
  })
})

describe('행정구역 개편 — 폐지 지역 (2026.07 인천 분할)', () => {
  const latestYm = getAvailableMonths().at(-1)!
  const retired = () => getAllRegions().filter(r => r.retiredAfter)

  it('폐지 지역은 마지막 데이터 월과 승계 지역을 갖는다', () => {
    const list = retired()
    expect(list.length).toBeGreaterThan(0)
    for (const r of list) {
      expect(r.retiredAfter! < latestYm, `${r.sigungu}`).toBe(true)
      expect(r.successorCodes?.length ?? 0).toBeGreaterThan(0)
    }
  })

  it('승계 지역은 실제로 존재하는 현행 지역이다', () => {
    const byCode = new Map(getAllRegions().map(r => [r.code, r]))
    for (const r of retired()) {
      for (const code of r.successorCodes ?? []) {
        const s = byCode.get(code)
        expect(s, `${r.sigungu} 의 승계 지역 ${code} 가 없다`).toBeDefined()
        expect(s!.retiredAfter).toBeUndefined()
      }
    }
  })

  it('폐지 지역은 최신월 순위·합계에서 빠진다', () => {
    const ranked = new Set(getAllRegionRankings(latestYm).map(e => e.region.code))
    for (const r of retired()) expect(ranked.has(r.code), `${r.sigungu}`).toBe(false)
  })

  it('폐지 지역의 과거 이력은 그대로 조회된다', () => {
    for (const r of retired()) {
      const detail = getRegionDetail(r.code, r.retiredAfter!, 12)
      expect(detail, `${r.sigungu} 의 ${r.retiredAfter} 이력이 없다`).not.toBeNull()
      expect(detail!.latest.population).toBeGreaterThan(0)
    }
  })

  it('기준월 데이터가 없으면 다른 달로 폴백하지 않는다 (A4-1)', () => {
    // 폴백이 살아 있으면 화면은 '2026년 7월'이라 쓰면서 6월 수치를 보여준다.
    for (const r of retired()) {
      expect(getRegionDetail(r.code, latestYm, 12), `${r.sigungu}`).toBeNull()
    }
  })
})

describe('세대 분화 지표 (N-2)', () => {
  const latestYm = getAvailableMonths().at(-1)!
  const entries = getAllRegionRankings(latestYm)

  it('세대수 증가율 − 인구 증가율로 계산된다', () => {
    const months = getAvailableMonths()
    const yoyYm = months[months.length - 13]
    let checked = 0
    for (const e of entries.slice(0, 30)) {
      const json = JSON.parse(
        fs.readFileSync(path.join(REGIONS_DIR, `${e.region.code}.json`), 'utf-8'),
      ) as { months: Record<string, { population: number; households: number }> }
      const yoy = json.months[yoyYm]
      if (!yoy || yoy.population === 0 || yoy.households === 0) {
        expect(e.householdDivergence, `${e.region.sigungu}`).toBeNull()
        continue
      }
      const cur = json.months[latestYm]
      const expected =
        ((cur.households - yoy.households) / yoy.households) * 100 -
        ((cur.population - yoy.population) / yoy.population) * 100
      expect(e.householdDivergence!, `${e.region.sigungu}`).toBeCloseTo(expected, 6)
      checked++
    }
    expect(checked).toBeGreaterThan(0)
  })

  it('전년 데이터가 없는 신설 지역은 null 이다', () => {
    // 2026.07 인천 신설 4곳은 1개월치뿐이라 전년 비교가 불가능하다
    const newborn = entries.filter(e => ['2812500000', '2815500000', '2827500000', '2829000000'].includes(e.region.code))
    expect(newborn.length).toBeGreaterThan(0)
    for (const e of newborn) expect(e.householdDivergence, e.region.sigungu).toBeNull()
  })

  it('값이 실제로 지역마다 갈린다 — 상수가 아니다', () => {
    const vals = entries.map(e => e.householdDivergence).filter((v): v is number => v !== null)
    expect(vals.length).toBeGreaterThan(100)
    expect(new Set(vals.map(v => v.toFixed(1))).size).toBeGreaterThanOrEqual(5)
    // 대부분 양수(1인 가구 증가라는 전국 추세)지만 반대인 지역도 있어야 한다
    expect(vals.some(v => v > 0)).toBe(true)
    expect(vals.some(v => v < 0)).toBe(true)
  })
})

describe('시도명 ↔ 지도 매핑', () => {
  it('지도의 모든 시도명이 실제 집계 결과에 존재한다', () => {
    // 어긋나면 해당 도형만 조용히 회색으로 남는다 — 화면만 봐서는 못 잡는다.
    const actual = new Set(getSidoStats().map(s => s.sido))
    const missing = [...new Set(Object.values(SVG_ID_TO_SIDO))].filter(s => !actual.has(s))
    expect(missing).toEqual([])
  })

  it('집계에 있는 모든 시도가 지도에 그려진다', () => {
    const mapped = new Set(Object.values(SVG_ID_TO_SIDO))
    const unmapped = getSidoStats().map(s => s.sido).filter(s => !mapped.has(s))
    expect(unmapped).toEqual([])
  })
})

describe('구별 현황 드릴다운', () => {
  const latestYm = getAvailableMonths().at(-1)!

  it('일반구를 가진 시는 자식 목록을 반환한다', () => {
    const seongnam = getRegionBySlug('경기도', '성남시')
    expect(seongnam).not.toBeNull()
    const children = getChildDistricts(seongnam!, latestYm)
    expect(children.length).toBeGreaterThan(0)
    expect(children.every(c => c.region.level === 'district')).toBe(true)
    // 인구 내림차순
    const pops = children.map(c => c.population)
    expect([...pops]).toEqual([...pops].sort((a, b) => b - a))
  })

  it('일반구가 없는 지역은 빈 배열을 반환한다', () => {
    const jongno = getRegionBySlug('서울특별시', '종로구')
    expect(getChildDistricts(jongno!, latestYm)).toEqual([])
  })

  it('자식 인구의 합이 부모 시 인구와 일치한다 — 이중 계상의 근거', () => {
    const seongnam = getRegionBySlug('경기도', '성남시')!
    const children = getChildDistricts(seongnam, latestYm)
    const childSum = children.reduce((s, c) => s + c.population, 0)
    const parentJson = JSON.parse(
      fs.readFileSync(path.join(REGIONS_DIR, `${seongnam.code}.json`), 'utf-8'),
    ) as { months: Record<string, { population: number }> }
    expect(childSum).toBe(parentJson.months[latestYm].population)
  })
})
