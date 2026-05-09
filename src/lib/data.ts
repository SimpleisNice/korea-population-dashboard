import fs from 'fs'
import path from 'path'
import { parseMoisCSV } from './csv-parser'
import type { Region, RegionDetail, TrendPoint, AgeGroup, MigrationPoint, MonthlyStats } from './types'

// ── mock generators (연령/전입출 CSV 미제공 시 임시) ─────────────────────────

function makeAgeGroups(seed: number): AgeGroup[] {
  const labels = ['0–9', '10–19', '20–29', '30–39', '40–49', '50–59', '60–69', '70–79', '80+']
  let s = seed
  return labels.map(label => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    const male = (s % 15000) + 8000
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    const female = (s % 15000) + 8000
    return { label, male, female }
  })
}

function makeMigration(seed: number, months: string[]): MigrationPoint[] {
  let s = seed
  return months.map(key => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    const inflow = (s % 3000) + 1000
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    const outflow = (s % 3000) + 1000
    return {
      label: `${key.slice(0, 4)}.${key.slice(4)}`,
      inflow,
      outflow,
      net: inflow - outflow,
    }
  })
}

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

function loadData() {
  if (regionsCache && allDataCache) return { regions: regionsCache, data: allDataCache }

  const dataDir = path.join(process.cwd(), 'public', 'data')
  const files = fs.readdirSync(dataDir)
    .filter(f => /^resident_population_household_status_\d{6}_\d{6}\.csv$/.test(f))
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

export function getRegionDetail(code: string): RegionDetail | null {
  const { regions, data } = loadData()
  const region = regions.find(r => r.code === code)
  if (!region) return null

  const monthMap = data.get(code)
  if (!monthMap) return null

  const sortedKeys = [...monthMap.keys()].sort()
  const recentKeys = sortedKeys.slice(-12)
  if (recentKeys.length === 0) return null

  const trend: TrendPoint[] = recentKeys.map((key, i) => {
    const stats = monthMap.get(key)!
    const prevStats = i > 0 ? monthMap.get(recentKeys[i - 1]) : null
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

  const seed = parseInt(code.slice(0, 6), 10)

  return {
    region,
    latest,
    prevMonth,
    trend,
    ageGroups: makeAgeGroups(seed),
    migration: makeMigration(seed, recentKeys),
  }
}
