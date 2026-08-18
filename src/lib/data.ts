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
    const data = JSON.parse(raw) as RegionJSON
    return { ...data, region: normalizeRegion(data.region) }
  } catch {
    return null
  }
}

// ── sigungu 명칭 정규화 ───────────────────────────────────────────────────────
// csv-to-json.ts 가 LEGACY_CODE_MAP 을 통해 구 코드 데이터를 신 코드로 병합하므로
// 신 JSON 에는 이미 clean 한 이름이 저장된다.
// 아래 함수는 구 JSON 파일이 캐시에 남아있는 경우를 대비한 안전망으로만 유지한다.
const STALE_SIDO_PREFIXES = ['강원도 ', '전라북도 ', '강원특별자치도 ', '전북특별자치도 ']

function normalizeRegion(region: Region): Region {
  for (const prefix of STALE_SIDO_PREFIXES) {
    if (region.sigungu.startsWith(prefix)) {
      return { ...region, sigungu: region.sigungu.slice(prefix.length) }
    }
  }
  return region
}

// ── 지역 목록 캐시 (index.json — 전체에서 한 번만 읽음) ──────────────────────

let indexCache: Region[] | null = null

function loadIndex(): Region[] {
  if (indexCache) return indexCache
  const raw = fs.readFileSync(path.join(REGIONS_DIR, 'index.json'), 'utf-8')
  indexCache = (JSON.parse(raw) as Region[]).map(normalizeRegion)
  return indexCache
}

// ── 집계 대상 셀렉터 ──────────────────────────────────────────────────────────
// 전국·시도 합계와 순위는 반드시 최상위 시군구(level === 'sigungu')만 사용한다.
// 일반구(수원시 장안구 등)는 부모 시에 이미 포함되어 있어, 함께 더하면 이중 계상된다.
// 필터링은 여기 한 곳에서만 정의한다 — 각 함수가 개별로 거르면 다음에 또 어긋난다.
// docs/principles.md A1 참고.

let topLevelCache: Region[] | null = null

export function getTopLevelRegions(): Region[] {
  if (topLevelCache) return topLevelCache
  topLevelCache = loadIndex().filter(r => r.level === 'sigungu')
  return topLevelCache
}

// ── public API ────────────────────────────────────────────────────────────────

// 검색·비교 등 "지역을 고르는" 용도. 일반구를 포함한 전체 목록이다.
// 합계·순위에는 쓰지 말 것 — getTopLevelRegions() 를 쓴다.
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
  const regions = getTopLevelRegions()

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

export interface ChildDistrict {
  region: Region
  population: number
  yoyChange: number | null
}

/**
 * 부모 시에 속한 일반구 목록. 일반구는 합계·순위에서 제외되므로,
 * 부모 시 상세 페이지가 이들에 도달하는 유일한 경로다.
 * 일반구가 없는 지역(대부분)은 빈 배열을 반환한다.
 */
export function getChildDistricts(parent: Region, ym: string): ChildDistrict[] {
  if (parent.level !== 'sigungu') return []

  const prefix = `${parent.code.slice(0, 4)}`
  const namePrefix = `${parent.sigungu} `
  const months = getAvailableMonths()
  const ymIdx = months.indexOf(ym)
  const yoyYm = ymIdx >= 12 ? months[ymIdx - 12] : null

  return loadIndex()
    .filter(r =>
      r.level === 'district' &&
      r.code.startsWith(prefix) &&
      r.sigungu.startsWith(namePrefix),
    )
    .flatMap(r => {
      const regionMonths = readRegionJSON(r.code)?.months
      const stats = regionMonths?.[ym]
      if (!stats) return []
      const yoyStats = yoyYm ? regionMonths?.[yoyYm] ?? null : null
      return [{
        region: r,
        population: stats.population,
        yoyChange: yoyStats ? stats.population - yoyStats.population : null,
      }]
    })
    .sort((a, b) => b.population - a.population)
}

let availableMonthsCache: string[] | null = null

/**
 * 서비스가 제공하는 연월 목록.
 *
 * 이전에는 index 첫 지역(종로구)의 월 키만 읽었다. 그 지역 하나가 최신월을 갖지 못하면
 * 서비스 전체의 기준월이 조용히 밀리는 단일 장애점이었다.
 * 이제 최상위 시군구 전체의 합집합을 쓴다 — 한 지역이 빠져도 기준월은 유지되고,
 * 그 지역은 순위·합계에서 제외될 뿐이다 (docs/principles.md A4-1).
 */
export function getAvailableMonths(): string[] {
  if (availableMonthsCache) return availableMonthsCache

  const months = new Set<string>()
  for (const r of getTopLevelRegions()) {
    const json = readRegionJSON(r.code)
    if (!json) continue
    for (const ym of Object.keys(json.months)) months.add(ym)
  }

  availableMonthsCache = [...months].sort()
  return availableMonthsCache
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

  // 기준월을 지정했는데 그 달 데이터가 없으면 null 이다. 그 지역의 마지막 달로
  // 되돌리면 화면은 '2026년 7월'이라고 쓰면서 6월 수치를 보여주게 된다 — 기준월을
  // 명시한 화면에 다른 시점을 섞으면 화면 전체가 틀린 것이 된다(principles.md A4-1).
  // 개편으로 폐지된 지역(Region.retiredAfter)이 정확히 이 경로를 탄다.
  const refIdx = refMonth ? sortedKeys.indexOf(refMonth) : -1
  if (refMonth && refIdx < 0) return null
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
      householdsChange: prevStats ? stats.households - prevStats.households : 0,
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

  // 기준월 데이터가 실제로 있는 최상위 시군구만 순위 대상이다.
  // 과거 값으로 폴백하면 화면의 기준월 표기와 데이터 시점이 어긋난다 (docs/principles.md A4-1).
  const withPop = getTopLevelRegions().flatMap(r => {
    const stats = readRegionJSON(r.code)?.months[ym]
    return stats ? [{ code: r.code, sido: r.sido, population: stats.population }] : []
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
  const regions = getTopLevelRegions()
  const months = getAvailableMonths()
  const ymIdx = months.indexOf(ym)
  const prevYm = ymIdx > 0 ? months[ymIdx - 1] : null
  const yoyYm = ymIdx >= 12 ? months[ymIdx - 12] : null
  const rankings = buildRankings(ym)
  const entries: RegionRankEntry[] = []

  for (const r of regions) {
    const json = readRegionJSON(r.code)
    if (!json) continue
    // 기준월 데이터가 없으면 순위에서 제외한다 (폴백 금지 — buildRankings 와 동일 규칙)
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
  const regions = getTopLevelRegions()
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
  const regions = getTopLevelRegions()

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
  const regions = getTopLevelRegions()

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
  const regions = getTopLevelRegions()
  if (months.length === 0) return []

  const endYm = months[months.length - 1]
  const startYm = months.length >= 13 ? months[months.length - 13] : months[0]

  // pop 은 기준월 총인구, cmpEnd/cmpStart 는 변화율 계산용이다.
  // 두 시점을 모두 가진 지역만 변화율 분모·분자에 넣어야 비교 기준이 일치한다.
  const sidoMap = new Map<string, { pop: number; cmpEnd: number; cmpStart: number }>()

  for (const r of regions) {
    const json = readRegionJSON(r.code)
    const end = json?.months[endYm]
    if (!json || !end) continue
    const start = json.months[startYm] ?? null
    const acc = sidoMap.get(r.sido) ?? { pop: 0, cmpEnd: 0, cmpStart: 0 }
    acc.pop += end.population
    if (start) {
      acc.cmpEnd += end.population
      acc.cmpStart += start.population
    }
    sidoMap.set(r.sido, acc)
  }

  sidoStatsCache = Array.from(sidoMap.entries()).map(([sido, { pop, cmpEnd, cmpStart }]) => ({
    sido,
    population: pop,
    changeRate: cmpStart > 0 ? (cmpEnd - cmpStart) / cmpStart : 0,
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

  const regions = getTopLevelRegions()
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
