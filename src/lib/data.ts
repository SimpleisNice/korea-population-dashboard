import fs from 'fs'
import path from 'path'
import type { Region, RegionDetail, RegionRank, RegionRankEntry, NationalSummary, TrendEntry, TrendPoint, AgeGroup, MonthlyStats } from './types'

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

// ── public API ────────────────────────────────────────────────────────────────

export function getAllRegions(): Region[] {
  return loadIndex()
}

let popularCache: { code: string; rate: number }[] | null = null

export function getPopularRegions(): { code: string; rate: number }[] {
  if (popularCache) return popularCache

  const months = getAvailableMonths()
  if (months.length < 13) {
    popularCache = ['1168000000', '1171000000', '4113500000', '1144000000', '2635000000', '4159000000'].map(code => ({ code, rate: 0 }))
    return popularCache
  }

  const endYm = months[months.length - 1]
  const startYm = months[months.length - 13]
  const regions = loadIndex()

  const ranked = regions
    .map(r => {
      const json = readRegionJSON(r.code)
      if (!json) return null
      const end = json.months[endYm]
      const start = json.months[startYm]
      if (!end || !start || start.population === 0) return null
      const rate = (end.population - start.population) / start.population
      return { code: r.code, sido: r.sido, rate }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.rate - a.rate)

  const result: { code: string; rate: number }[] = []
  const sidoSeen = new Set<string>()
  for (const entry of ranked) {
    if (sidoSeen.has(entry.sido)) continue
    result.push({ code: entry.code, rate: entry.rate })
    sidoSeen.add(entry.sido)
    if (result.length === 6) break
  }

  popularCache = result
  return result
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

// range: 개월 수 (0 = 전체 기간, 기본값 12)
export function getRegionDetail(code: string, refMonth?: string, range = 12): RegionDetail | null {
  const json = readRegionJSON(code)
  if (!json) return null

  const { region, months, ages } = json
  const sortedKeys = Object.keys(months).sort()
  if (sortedKeys.length === 0) return null

  const refIdx = refMonth ? sortedKeys.indexOf(refMonth) : -1
  const endIdx = refIdx >= 0 ? refIdx : sortedKeys.length - 1
  const windowSize = range <= 0 ? endIdx + 1 : Math.min(range, endIdx + 1)
  const startIdx = endIdx - windowSize + 1
  const recentKeys = sortedKeys.slice(startIdx, endIdx + 1)
  if (recentKeys.length === 0) return null

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

  // 연령 데이터: latestKey에 가장 가까운 월 사용
  const sortedAgeKeys = Object.keys(ages).sort()
  const ageKey = sortedAgeKeys.filter(k => k <= latestKey).at(-1) ?? sortedAgeKeys.at(-1)
  const ageGroups: AgeGroup[] = (ageKey ? ages[ageKey] : undefined) ?? []

  return { region, latest, prevMonth, yoyMonth, trend, ageGroups }
}

export function getAgeGroups(code: string, ym: string): AgeGroup[] | null {
  const json = readRegionJSON(code)
  if (!json) return null
  const sortedAgeKeys = Object.keys(json.ages).sort()
  const ageKey = sortedAgeKeys.filter(k => k <= ym).at(-1) ?? sortedAgeKeys.at(-1)
  return ageKey ? json.ages[ageKey] ?? null : null
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

export function getAllRegionRankings(ym: string): RegionRankEntry[] {
  const regions = loadIndex()
  const months = getAvailableMonths()
  const ymIdx = months.indexOf(ym)
  const prevYm = ymIdx > 0 ? months[ymIdx - 1] : null
  const yoyYm = ymIdx >= 12 ? months[ymIdx - 12] : null
  const rankings = buildRankings(ym)
  const entries: RegionRankEntry[] = []

  for (const r of regions) {
    const json = readRegionJSON(r.code)
    if (!json) continue
    const stats = json.months[ym]
    if (!stats) continue
    const prevStats = prevYm ? json.months[prevYm] ?? null : null
    const yoyStats = yoyYm ? json.months[yoyYm] ?? null : null
    const rank = rankings.get(r.code)
    if (!rank) continue

    entries.push({
      region: r,
      population: stats.population,
      households: stats.households,
      householdSize: stats.householdSize,
      popChange: prevStats ? stats.population - prevStats.population : 0,
      popChangeYoy: yoyStats ? stats.population - yoyStats.population : 0,
      popChangeRate: yoyStats && yoyStats.population > 0
        ? ((stats.population - yoyStats.population) / yoyStats.population) * 100
        : 0,
      rank,
    })
  }

  return entries
}

// ── 인구 트렌드 ───────────────────────────────────────────────────────────────

const trendCache = new Map<number, { gainers: TrendEntry[]; losers: TrendEntry[] }>()

export function getPopulationTrends(periodMonths: 3 | 6 | 12): { gainers: TrendEntry[]; losers: TrendEntry[] } {
  if (trendCache.has(periodMonths)) return trendCache.get(periodMonths)!

  const months = getAvailableMonths()
  if (months.length <= periodMonths) return { gainers: [], losers: [] }

  const endYm = months[months.length - 1]
  const startYm = months[months.length - 1 - periodMonths]
  const regions = loadIndex()
  const entries: TrendEntry[] = []

  for (const r of regions) {
    const json = readRegionJSON(r.code)
    if (!json) continue
    const endStats = json.months[endYm]
    const startStats = json.months[startYm]
    if (!endStats || !startStats) continue

    const change = endStats.population - startStats.population
    const changeRate = startStats.population > 0
      ? (change / startStats.population) * 100
      : 0
    entries.push({ region: r, startPop: startStats.population, endPop: endStats.population, change, changeRate })
  }

  entries.sort((a, b) => b.change - a.change)

  const result = {
    gainers: entries.slice(0, 10),
    losers: entries.slice(-10).reverse(),
  }
  trendCache.set(periodMonths, result)
  return result
}

// ── 홈 탭용: 급감/고령화 지역 (시도별 1개, TOP 6) ────────────────────────────

let decliningCache: { code: string; rate: number }[] | null = null

export function getDecliningRegions(): { code: string; rate: number }[] {
  if (decliningCache) return decliningCache

  const months = getAvailableMonths()
  if (months.length < 13) return []

  const endYm = months[months.length - 1]
  const startYm = months[months.length - 13]
  const regions = loadIndex()

  const ranked = regions
    .map(r => {
      const json = readRegionJSON(r.code)
      if (!json) return null
      const end = json.months[endYm]
      const start = json.months[startYm]
      if (!end || !start || start.population === 0) return null
      const rate = (end.population - start.population) / start.population
      return { code: r.code, sido: r.sido, rate }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.rate - b.rate)

  const result: { code: string; rate: number }[] = []
  const sidoSeen = new Set<string>()
  for (const entry of ranked) {
    if (sidoSeen.has(entry.sido)) continue
    result.push({ code: entry.code, rate: entry.rate })
    sidoSeen.add(entry.sido)
    if (result.length === 6) break
  }

  decliningCache = result
  return result
}

let agingCache: { code: string; rate: number }[] | null = null

export function getAgingRegions(): { code: string; rate: number }[] {
  if (agingCache) return agingCache

  const months = getAvailableMonths()
  if (months.length === 0) return []
  const latestYm = months[months.length - 1]
  const regions = loadIndex()

  const ELDERLY = ['60–69', '70–79', '80+']
  const YOUTH = ['0–9', '10–19']

  const ranked = regions
    .map(r => {
      const json = readRegionJSON(r.code)
      if (!json) return null
      const sortedAgeKeys = Object.keys(json.ages).sort()
      const ageKey = sortedAgeKeys.filter(k => k <= latestYm).at(-1) ?? sortedAgeKeys.at(-1)
      if (!ageKey) return null
      const groups = json.ages[ageKey]
      if (!groups) return null

      const elderly = groups.filter(g => ELDERLY.includes(g.label)).reduce((s, g) => s + g.male + g.female, 0)
      const youth = groups.filter(g => YOUTH.includes(g.label)).reduce((s, g) => s + g.male + g.female, 0)
      if (youth === 0) return null
      const index = elderly / youth * 100
      return { code: r.code, sido: r.sido, index }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.index - a.index)

  const result: { code: string; rate: number }[] = []
  const sidoSeen = new Set<string>()
  for (const entry of ranked) {
    if (sidoSeen.has(entry.sido)) continue
    result.push({ code: entry.code, rate: entry.index })
    sidoSeen.add(entry.sido)
    if (result.length === 6) break
  }

  agingCache = result
  return result
}

// ── 시도별 집계 통계 (지도 히트맵용) ───────────────────────────────────────────

export interface SidoStat {
  sido: string
  population: number
  changeRate: number
}

let sidoStatsCache: SidoStat[] | null = null

export function getSidoStats(): SidoStat[] {
  if (sidoStatsCache) return sidoStatsCache

  const months = getAvailableMonths()
  const regions = loadIndex()
  if (months.length === 0) return []

  const endYm = months[months.length - 1]
  const startYm = months.length >= 13 ? months[months.length - 13] : months[0]

  const sidoMap = new Map<string, { pop: number; prevPop: number }>()

  for (const r of regions) {
    const json = readRegionJSON(r.code)
    if (!json) continue
    const end = json.months[endYm]
    const start = json.months[startYm]
    if (!end) continue
    const acc = sidoMap.get(r.sido) ?? { pop: 0, prevPop: 0 }
    acc.pop += end.population
    if (start) acc.prevPop += start.population
    sidoMap.set(r.sido, acc)
  }

  sidoStatsCache = Array.from(sidoMap.entries()).map(([sido, { pop, prevPop }]) => ({
    sido,
    population: pop,
    changeRate: prevPop > 0 ? (pop - prevPop) / prevPop : 0,
  }))
  return sidoStatsCache
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
