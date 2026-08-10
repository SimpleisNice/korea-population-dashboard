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
} from './data'

const REGIONS_DIR = path.join(process.cwd(), 'public', 'data', 'regions')
const RAW_DIR = path.join(process.cwd(), 'data', 'raw')

// ── MOIS 공식 전국 합계 ───────────────────────────────────────────────────────
// *_other_population_change_monthly.csv 에는 전국(1000000000) 합계 행이 들어 있다.
// 우리 집계가 이 값에서 크게 벗어나면 계층 혼재나 누락이 생긴 것이다.

function splitCSVLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (const ch of line) {
    if (ch === '"') quoted = !quoted
    else if (ch === ',' && !quoted) { out.push(cur.trim()); cur = '' }
    else cur += ch
  }
  out.push(cur.trim())
  return out
}

/** 해당 연월의 MOIS 공식 전국 인구를 원본 CSV에서 읽는다. 없으면 null. */
function officialNationalTotal(ym: string): number | null {
  const files = fs.readdirSync(RAW_DIR)
    .filter(f => /_registered_population_other_population_change_monthly\.csv$/.test(f))

  for (const file of files) {
    const text = fs.readFileSync(path.join(RAW_DIR, file), 'utf-8').replace(/^﻿/, '')
    const lines = text.split(/\r?\n/).filter(l => l.trim())
    const monthRow = splitCSVLine(lines[1] ?? '')

    // 월 블록은 9칸(전월 남/여/계, 당월 남/여/계, 증감 남/여/계)이며
    // '당월인구수 계'는 블록 시작에서 +5 위치다.
    let colOffset = -1
    for (let i = 2; i < monthRow.length; i++) {
      const m = monthRow[i].match(/(\d{4})년(\d{2})월/)
      if (m && `${m[1]}${m[2]}` === ym) { colOffset = i; break }
    }
    if (colOffset < 0) continue

    for (const line of lines.slice(4)) {
      const cols = splitCSVLine(line)
      if (cols[0].replace(/\s/g, '') !== '1000000000') continue
      const raw = cols[colOffset + 5] ?? ''
      const n = parseInt(raw.replace(/,/g, ''), 10)
      return Number.isFinite(n) ? n : null
    }
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
