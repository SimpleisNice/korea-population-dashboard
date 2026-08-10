/**
 * level 은 행정 계층을 구분한다.
 *  - 'sigungu'  : 최상위 시군구 (자치구·시·군). 전국·시도 합계와 순위의 기준 집합
 *  - 'district' : 일반구 (예: 수원시 장안구). 부모 시에 이미 포함되므로 합계·순위에서 제외
 * 계층을 섞어 집계하면 인구가 이중 계상된다 — docs/principles.md A1 참고.
 */
export type RegionLevel = 'sigungu' | 'district'

export interface Region {
  code: string
  sido: string
  sigungu: string
  level: RegionLevel
}

export interface MonthlyStats {
  year: number
  month: number
  population: number
  households: number
  householdSize: number
  male: number
  female: number
}

export interface TrendPoint {
  label: string
  population: number
  households: number
  change: number
  householdsChange: number
}

export interface AgeGroup {
  label: string
  male: number
  female: number
}

export interface RegionDetail {
  region: Region
  latest: MonthlyStats
  prevMonth: MonthlyStats | null
  yoyMonth: MonthlyStats | null
  trend: TrendPoint[]
  ageGroups: AgeGroup[]
}

export interface RegionRank {
  nationalRank: number
  nationalTotal: number
  sidoRank: number
  sidoTotal: number
}

export interface NationalSummary {
  totalPopulation: number
  prevMonthChange: number
  month: string
}

export interface RegionRankEntry {
  region: Region
  population: number
  households: number
  householdSize: number
  popChange: number
  popChangeYoy: number
  popChangeRate: number
  rank: RegionRank
}

export interface TrendEntry {
  region: Region
  startPop: number
  endPop: number
  change: number
  changeRate: number
}

export interface CompareData {
  a: RegionDetail
  b: RegionDetail
}
