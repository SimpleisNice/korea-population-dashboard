'use server'

import { getRegionDetail, getMonthStats } from './data'
import type { RegionDetail, MonthlyStats } from './types'

export async function fetchRegionDetail(code: string, ym?: string): Promise<RegionDetail | null> {
  return getRegionDetail(code, ym)
}

export async function fetchMonthStats(code: string, ym: string): Promise<MonthlyStats | null> {
  return getMonthStats(code, ym)
}
