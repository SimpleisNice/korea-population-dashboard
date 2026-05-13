import fs from 'fs'
import path from 'path'
import type { Region, RegionDetail, RegionRank, NationalSummary, TrendPoint, AgeGroup, MonthlyStats } from './types'

// ── JSON 파일 경로 ────────────────────────────────────────────────────────────

const REGIONS_DIR = path.join(process.cwd(), 'public', 'data', 'regions')

interface RegionJSON {
  region: Region
  months: Record<string, MonthlyStats>
  ages: Record<string, AgeGroup[]>
}

function readRegionJSON(code: string): RegionJSON | null {
  try {
    const raw = fs.readFileSync(path.join(REGIONS_DIR, `${code}.json`), 'utf-8')
    return JSON.parse(raw) as RegionJSON
  } catch {
    return null
  }
}

// ── 지역 목록 캐시 (index.json — 전체에서 한 번만 읽음) ──────────────────────

let indexCache: Region[] | null = null

function loadIndex(): Region[] {
  if (indexCache) return indexCache
  const raw = fs.readFileSync(path.join(REGIONS_DIR, 'index.json'), 'utf-8')
  indexCache = JSON.parse(raw) as Region[]
  return indexCache
}

// ── 상수 ─────────────────────────────────────────────────────────────────────

const POPULAR_CODES = [
  '1168000000', // 강남구
  '1171000000', // 송파구
  '4113500000', // 성남시 분당구
  '1144000000', // 마포구
  '2635000000', // 해운대구
  '4159000000', // 화성시
]

// ── public API ────────────────────────────────────────────────────────────────

export function getAllRegions(): Region[] {
  return loadIndex()
}

export function getPopularRegions(): string[] {
  return POPULAR_CODES
}

export function getRegionBySlug(sido: string, sigungu: string): Region | null {
  return loadIndex().find(r => r.sido === sido && r.sigungu === sigungu) ?? null
}

export function getAvailableMonths(): string[] {
  // 첫 번째 지역 JSON에서 월 목록 추출 (모든 지역 동일)
  const regions = loadIndex()
  if (regions.length === 0) return []
  const json = readRegionJSON(regions[0].code)
  return json ? Object.keys(json.months).sort() : []
}

export function getMonthStats(code: string, ym: string): MonthlyStats | null {
  return readRegionJSON(code)?.months[ym] ?? null
}

export function getRegionDetail(code: string, refMonth?: string): RegionDetail | null {
  const json = readRegionJSON(code)
  if (!json) return null

  const { region, months, ages } = json
  const sortedKeys = Object.keys(months).sort()
  if (sortedKeys.length === 0) return null

  // 12개월 윈도우 결정
  const refIdx = refMonth ? sortedKeys.indexOf(refMonth) : -1
  const endIdx = refIdx >= 0 ? refIdx : sortedKeys.length - 1
  const startIdx = Math.max(0, endIdx - 11)
  const recentKeys = sortedKeys.slice(startIdx, endIdx + 1)
  if (recentKeys.length === 0) return null

  // 첫 번째 증감 계산을 위해 이전 월 키 참조
  const preKey = startIdx > 0 ? sortedKeys[startIdx - 1] : null

  const trend: TrendPoint[] = recentKeys.map((key, i) => {
    const stats = months[key]
    const prevKey = i > 0 ? recentKeys[i - 1] : preKey
    const prevStats = prevKey ? months[prevKey] : null
    return {
      label: `${key.slice(0, 4)}.${key.slice(4)}`,
      population: stats.population,
      households: stats.households,
      change: prevStats ? stats.population - prevStats.population : 0,
    }
  })

  const latestKey = recentKeys[recentKeys.length - 1]
  const latest = months[latestKey]
  const prevMonth = recentKeys.length >= 2
    ? months[recentKeys[recentKeys.length - 2]] ?? null
    : null

  // 전년 동월 (12개월 전)
  const latestIdx = sortedKeys.indexOf(latestKey)
  const yoyKey = latestIdx >= 12 ? sortedKeys[latestIdx - 12] : null
  const yoyMonth: MonthlyStats | null = yoyKey ? months[yoyKey] ?? null : null

  // 연령 데이터: 가장 최신 월 사용
  const sortedAgeKeys = Object.keys(ages).sort()
  const latestAgeKey = sortedAgeKeys.at(-1)
  const ageGroups: AgeGroup[] = (latestAgeKey ? ages[latestAgeKey] : undefined) ?? []

  return { region, latest, prevMonth, yoyMonth, trend, ageGroups }
}

// ── 전국 순위 ─────────────────────────────────────────────────────────────────

const rankCache = new Map<string, Map<string, RegionRank>>()

function buildRankings(ym: string): Map<string, RegionRank> {
  if (rankCache.has(ym)) return rankCache.get(ym)!

  const regions = loadIndex()
  const withPop = regions.map(r => {
    const json = readRegionJSON(r.code)
    return { code: r.code, sido: r.sido, population: json?.months[ym]?.population ?? 0 }
  })

  const sorted = [...withPop].sort((a, b) => b.population - a.population)

  const sidoMap = new Map<string, typeof withPop>()
  for (const e of withPop) {
    if (!sidoMap.has(e.sido)) sidoMap.set(e.sido, [])
    sidoMap.get(e.sido)!.push(e)
  }

  const sidoSorted = new Map<string, typeof withPop>()
  sidoMap.forEach((list, sido) => {
    sidoSorted.set(sido, [...list].sort((a, b) => b.population - a.population))
  })

  const result = new Map<string, RegionRank>()
  for (let i = 0; i < sorted.length; i++) {
    const e = sorted[i]
    const sidoList = sidoSorted.get(e.sido)!
    result.set(e.code, {
      nationalRank: i + 1,
      nationalTotal: sorted.length,
      sidoRank: sidoList.findIndex(s => s.code === e.code) + 1,
      sidoTotal: sidoList.length,
    })
  }

  rankCache.set(ym, result)
  return result
}

export function getRegionRank(code: string, ym: string): RegionRank | null {
  return buildRankings(ym).get(code) ?? null
}

// ── 전국 총괄 현황 ─────────────────────────────────────────────────────────────

let nationalSummaryCache: NationalSummary | null = null

export function getNationalSummary(): NationalSummary | null {
  if (nationalSummaryCache) return nationalSummaryCache

  const months = getAvailableMonths()
  if (months.length === 0) return null

  const latestYm = months[months.length - 1]
  const prevYm = months.length >= 2 ? months[months.length - 2] : null

  const regions = loadIndex()
  let totalPop = 0
  let prevTotalPop = 0

  for (const r of regions) {
    const json = readRegionJSON(r.code)
    if (!json) continue
    totalPop += json.months[latestYm]?.population ?? 0
    if (prevYm) prevTotalPop += json.months[prevYm]?.population ?? 0
  }

  nationalSummaryCache = {
    totalPopulation: totalPop,
    prevMonthChange: prevYm ? totalPop - prevTotalPop : 0,
    month: latestYm,
  }
  return nationalSummaryCache
}
