export interface Region {
  code: string
  sido: string
  sigungu: string
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
