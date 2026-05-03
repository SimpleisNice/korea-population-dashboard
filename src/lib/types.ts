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

export interface MigrationPoint {
  label: string
  inflow: number
  outflow: number
  net: number
}

export interface RegionDetail {
  region: Region
  latest: MonthlyStats
  prevMonth: MonthlyStats | null
  trend: TrendPoint[]
  ageGroups: AgeGroup[]
  migration: MigrationPoint[]
}

export interface CompareData {
  a: RegionDetail
  b: RegionDetail
}
