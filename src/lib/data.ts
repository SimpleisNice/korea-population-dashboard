import fs from 'fs'
import path from 'path'
import { parseMoisCSV, parseAgeCSV } from './csv-parser'
import type { Region, RegionDetail, TrendPoint, AgeGroup, MonthlyStats } from './types'

// ── data loading & caching ────────────────────────────────────────────────────

const POPULAR_CODES = [
  '1168000000', // 강남구
  '1171000000', // 송파구
  '4113500000', // 성남시 분당구
  '1144000000', // 마포구
  '2635000000', // 해운대구
  '4159000000', // 화성시
]

let regionsCache: Region[] | null = null
let allDataCache: Map<string, Map<string, MonthlyStats>> | null = null
let ageDataCache: Map<string, Map<string, AgeGroup[]>> | null = null

function loadData() {
  if (regionsCache && allDataCache) return { regions: regionsCache, data: allDataCache }

  const dataDir = path.join(process.cwd(), 'public', 'data')
  const files = fs.readdirSync(dataDir)
    .filter(f => /^\d{4}_(first|second)_half_registered_population_and_household_monthly\.csv$/.test(f))
    .sort()

  const mergedData = new Map<string, Map<string, MonthlyStats>>()
  let latestRegions: Region[] = []

  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8')
    const parsed = parseMoisCSV(content)
    latestRegions = parsed.regions
    for (const [code, monthMap] of parsed.data) {
      if (!mergedData.has(code)) mergedData.set(code, new Map())
      for (const [yyyymm, stats] of monthMap) {
        mergedData.get(code)!.set(yyyymm, stats)
      }
    }
  }

  regionsCache = latestRegions
  allDataCache = mergedData
  return { regions: latestRegions, data: mergedData }
}

function loadAgeData(): Map<string, Map<string, AgeGroup[]>> {
  if (ageDataCache) return ageDataCache

  const dataDir = path.join(process.cwd(), 'public', 'data')
  const files = fs.readdirSync(dataDir)
    .filter(f => /^\d{4}_(first|second)_half_population_by_age_monthly\.csv$/.test(f))
    .sort()

  const merged = new Map<string, Map<string, AgeGroup[]>>()

  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8')
    const { data } = parseAgeCSV(content)
    for (const [code, monthMap] of data) {
      if (!merged.has(code)) merged.set(code, new Map())
      for (const [yyyymm, groups] of monthMap) {
        merged.get(code)!.set(yyyymm, groups)
      }
    }
  }

  ageDataCache = merged
  return merged
}

// ── public API ────────────────────────────────────────────────────────────────

export function getAllRegions(): Region[] {
  return loadData().regions
}

export function getPopularRegions(): string[] {
  return POPULAR_CODES
}

export function getRegionBySlug(sido: string, sigungu: string): Region | null {
  return getAllRegions().find(r => r.sido === sido && r.sigungu === sigungu) ?? null
}

export function getAvailableMonths(): string[] {
  const { data } = loadData()
  const monthSet = new Set<string>()
  for (const monthMap of data.values()) {
    for (const key of monthMap.keys()) monthSet.add(key)
    break // all regions share the same month set
  }
  return [...monthSet].sort()
}

export function getMonthStats(code: string, ym: string): MonthlyStats | null {
  return loadData().data.get(code)?.get(ym) ?? null
}

export function getRegionDetail(code: string, refMonth?: string): RegionDetail | null {
  const { regions, data } = loadData()
  const region = regions.find(r => r.code === code)
  if (!region) return null

  const monthMap = data.get(code)
  if (!monthMap) return null

  const sortedKeys = [...monthMap.keys()].sort()
  if (sortedKeys.length === 0) return null

  // Determine the 12-month window ending at refMonth (or latest)
  const refIdx = refMonth ? sortedKeys.indexOf(refMonth) : -1
  const endIdx = refIdx >= 0 ? refIdx : sortedKeys.length - 1
  const startIdx = Math.max(0, endIdx - 11)
  const recentKeys = sortedKeys.slice(startIdx, endIdx + 1)
  if (recentKeys.length === 0) return null

  // Include the key before the window for computing the first change value
  const preKey = startIdx > 0 ? sortedKeys[startIdx - 1] : null

  const trend: TrendPoint[] = recentKeys.map((key, i) => {
    const stats = monthMap.get(key)!
    const prevKey = i > 0 ? recentKeys[i - 1] : preKey
    const prevStats = prevKey ? monthMap.get(prevKey) : null
    return {
      label: `${key.slice(0, 4)}.${key.slice(4)}`,
      population: stats.population,
      households: stats.households,
      change: prevStats ? stats.population - prevStats.population : 0,
    }
  })

  const latest = monthMap.get(recentKeys[recentKeys.length - 1])!
  const prevMonth = recentKeys.length >= 2
    ? monthMap.get(recentKeys[recentKeys.length - 2]) ?? null
    : null

  const ageMonthMap = loadAgeData().get(code)
  const latestAgeKey = ageMonthMap ? [...ageMonthMap.keys()].sort().at(-1) : undefined
  const ageGroups: AgeGroup[] = (latestAgeKey ? ageMonthMap?.get(latestAgeKey) : undefined) ?? []

  return {
    region,
    latest,
    prevMonth,
    trend,
    ageGroups,
  }
}
