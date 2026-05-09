'use server'

import { getRegionDetail } from './data'
import type { RegionDetail } from './types'

export async function fetchRegionDetail(code: string): Promise<RegionDetail | null> {
  return getRegionDetail(code)
}
