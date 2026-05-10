import type { MonthlyStats, Region, AgeGroup } from './types'

const SIDO_BY_PREFIX: Record<string, string> = {
  '11': '서울특별시',
  '26': '부산광역시',
  '27': '대구광역시',
  '28': '인천광역시',
  '29': '광주광역시',
  '30': '대전광역시',
  '31': '울산광역시',
  '36': '세종특별자치시',
  '41': '경기도',
  '42': '강원특별자치도',
  '43': '충청북도',
  '44': '충청남도',
  '45': '전북특별자치도',
  '46': '전라남도',
  '47': '경상북도',
  '48': '경상남도',
  '50': '제주특별자치도',
}

export function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuote = false
  for (const ch of line) {
    if (ch === '"') {
      inQuote = !inQuote
    } else if (ch === ',' && !inQuote) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

export function parseKoreanNumber(s: string): number {
  return parseInt(s.replace(/[,\s]/g, ''), 10) || 0
}

export interface ParsedCSV {
  regions: Region[]
  data: Map<string, Map<string, MonthlyStats>>
}

export function parseMoisCSV(content: string): ParsedCSV {
  // Strip UTF-8 BOM if present
  const text = content.startsWith('﻿') ? content.slice(1) : content
  const lines = text.split(/\r?\n/).filter(l => l.trim())

  // Row 2 (index 1): month labels at every 6th column starting at col 2
  const monthRow = splitCSVLine(lines[1])
  const months: Array<{ colOffset: number; year: number; month: number; key: string }> = []
  for (let i = 2; i < monthRow.length; i++) {
    const match = monthRow[i].match(/(\d{4})년(\d{2})월/)
    if (match) {
      months.push({
        colOffset: i,
        year: parseInt(match[1]),
        month: parseInt(match[2]),
        key: `${match[1]}${match[2]}`,
      })
    }
  }

  const regions: Region[] = []
  const data = new Map<string, Map<string, MonthlyStats>>()

  // Row 4+ (index 3+): data rows
  for (let rowIdx = 3; rowIdx < lines.length; rowIdx++) {
    const cols = splitCSVLine(lines[rowIdx])
    const code = cols[0].replace(/\s/g, '')
    if (!/^\d{10}$/.test(code)) continue
    // Skip 시도-level rows (last 8 digits all zero)
    if (code.endsWith('00000000')) continue

    const prefix = code.slice(0, 2)
    const sido = SIDO_BY_PREFIX[prefix]
    if (!sido) continue

    const rawName = cols[1].replace(/\s+/g, ' ').trim()
    const sigungu = rawName.startsWith(sido)
      ? rawName.slice(sido.length).trim()
      : rawName

    regions.push({ code, sido, sigungu })

    const monthMap = new Map<string, MonthlyStats>()
    for (const m of months) {
      const base = m.colOffset
      if (base + 4 >= cols.length) continue
      const population = parseKoreanNumber(cols[base])
      const households = parseKoreanNumber(cols[base + 1])
      const householdSize = parseFloat(cols[base + 2]) || 0
      const male = parseKoreanNumber(cols[base + 3])
      const female = parseKoreanNumber(cols[base + 4])
      if (!population) continue
      monthMap.set(m.key, { year: m.year, month: m.month, population, households, householdSize, male, female })
    }
    data.set(code, monthMap)
  }

  return { regions, data }
}

// ── Age CSV parser ────────────────────────────────────────────────────────────
// Structure: Row1=meta, Row2=month labels (every 39 cols from col2),
//            Row3=계/남/여, Row4=column headers, Row5+=data
// Per month at base: male ages at base+15..+25, female at base+28..+38
// 11 CSV age groups → 9 service groups (80~89 + 90~99 + 100이상 → 80+)

export interface ParsedAgeCSV {
  data: Map<string, Map<string, AgeGroup[]>>
}

export function parseAgeCSV(content: string): ParsedAgeCSV {
  const text = content.startsWith('﻿') ? content.slice(1) : content
  const lines = text.split(/\r?\n/).filter(l => l.trim())

  const monthRow = splitCSVLine(lines[1])
  const months: Array<{ colOffset: number; key: string }> = []
  for (let i = 2; i < monthRow.length; i++) {
    const match = monthRow[i].match(/(\d{4})년(\d{2})월/)
    if (match) {
      months.push({ colOffset: i, key: `${match[1]}${match[2]}` })
    }
  }

  const data = new Map<string, Map<string, AgeGroup[]>>()

  // data rows start at index 4 (one extra header row vs household CSV)
  for (let rowIdx = 4; rowIdx < lines.length; rowIdx++) {
    const cols = splitCSVLine(lines[rowIdx])
    const code = cols[0].replace(/\s/g, '')
    if (!/^\d{10}$/.test(code)) continue
    if (code.endsWith('00000000')) continue

    const prefix = code.slice(0, 2)
    if (!SIDO_BY_PREFIX[prefix]) continue

    const monthMap = data.get(code) ?? new Map<string, AgeGroup[]>()

    for (const { colOffset: base, key } of months) {
      if (base + 38 >= cols.length) continue
      const g = (i: number) => parseKoreanNumber(cols[i] ?? '0')

      const ageGroups: AgeGroup[] = [
        { label: '0–9',   male: g(base+15), female: g(base+28) },
        { label: '10–19', male: g(base+16), female: g(base+29) },
        { label: '20–29', male: g(base+17), female: g(base+30) },
        { label: '30–39', male: g(base+18), female: g(base+31) },
        { label: '40–49', male: g(base+19), female: g(base+32) },
        { label: '50–59', male: g(base+20), female: g(base+33) },
        { label: '60–69', male: g(base+21), female: g(base+34) },
        { label: '70–79', male: g(base+22), female: g(base+35) },
        {
          label: '80+',
          male:   g(base+23) + g(base+24) + g(base+25),
          female: g(base+36) + g(base+37) + g(base+38),
        },
      ]

      if (ageGroups[0].male + ageGroups[0].female === 0) continue
      monthMap.set(key, ageGroups)
    }

    data.set(code, monthMap)
  }

  return { data }
}
