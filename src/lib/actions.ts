'use server'

import { getRegionDetail, getMonthStats, getAgeGroups } from './data'
import type { RegionDetail, MonthlyStats, AgeGroup } from './types'

export async function fetchRegionDetail(code: string, ym?: string): Promise<RegionDetail | null> {
  return getRegionDetail(code, ym)
}

export async function fetchMonthStats(code: string, ym: string): Promise<MonthlyStats | null> {
  return getMonthStats(code, ym)
}

export async function fetchAgeGroups(code: string, ym: string): Promise<AgeGroup[] | null> {
  return getAgeGroups(code, ym)
}
