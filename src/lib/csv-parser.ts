import type { MonthlyStats, Region } from './types'

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
