import fs from 'fs'
import path from 'path'
import type { Region, RegionDetail, TrendPoint, AgeGroup, MonthlyStats } from './types'

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

  const latest = months[recentKeys[recentKeys.length - 1]]
  const prevMonth = recentKeys.length >= 2
    ? months[recentKeys[recentKeys.length - 2]] ?? null
    : null

  // 연령 데이터: 가장 최신 월 사용
  const sortedAgeKeys = Object.keys(ages).sort()
  const latestAgeKey = sortedAgeKeys.at(-1)
  const ageGroups: AgeGroup[] = (latestAgeKey ? ages[latestAgeKey] : undefined) ?? []

  return { region, latest, prevMonth, trend, ageGroups }
}
