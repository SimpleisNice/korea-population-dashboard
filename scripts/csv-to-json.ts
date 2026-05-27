/**
 * CSV → JSON 변환 스크립트
 * 실행: npm run build-data
 *
 * public/data/*.csv 를 읽어 public/data/regions/ 에 시군구별 JSON 파일 생성
 *   - public/data/regions/index.json   (전체 지역 목록)
 *   - public/data/regions/[code].json  (지역별 통계)
 */

import fs from 'fs'
import path from 'path'

// ── 타입 ─────────────────────────────────────────────────────────────────────

interface Region { code: string; sido: string; sigungu: string }
interface MonthlyStats { year: number; month: number; population: number; households: number; householdSize: number; male: number; female: number }
interface AgeGroup { label: string; male: number; female: number }
interface RegionJSON { region: Region; months: Record<string, MonthlyStats>; ages: Record<string, AgeGroup[]> }

// ── CSV 파싱 유틸 ─────────────────────────────────────────────────────────────

const SIDO_BY_PREFIX: Record<string, string> = {
  '11': '서울특별시', '26': '부산광역시', '27': '대구광역시', '28': '인천광역시',
  '29': '광주광역시', '30': '대전광역시', '31': '울산광역시', '36': '세종특별자치시',
  '41': '경기도',
  '42': '강원특별자치도', // 구 코드 (2023.06 이전)
  '43': '충청북도', '44': '충청남도',
  '45': '전북특별자치도', // 구 코드 (2023.12 이전)
  '46': '전라남도', '47': '경상북도', '48': '경상남도', '50': '제주특별자치도',
  '51': '강원특별자치도', // 신 코드 (2023.07~)
  '52': '전북특별자치도', // 신 코드 (2024.01~)
}

// ── 행정구역 개편 코드 매핑 ──────────────────────────────────────────────────
// 개편 전 구 코드 → 개편 후 신 코드
// 구 코드 데이터를 신 코드 JSON에 병합하여 시계열 연속성을 유지한다.
//
// ① 강원특별자치도 (2023.06.11 개편: 강원도 → 강원특별자치도, 42xx → 51xx)
// ② 전북특별자치도 (2024.01.18 개편: 전라북도 → 전북특별자치도, 45xx → 52xx)
const LEGACY_CODE_MAP: Record<string, string> = {
  // 강원특별자치도
  '4211000000': '5111000000', // 춘천시
  '4213000000': '5113000000', // 원주시
  '4215000000': '5115000000', // 강릉시
  '4217000000': '5117000000', // 동해시
  '4219000000': '5119000000', // 태백시
  '4221000000': '5121000000', // 속초시
  '4223000000': '5123000000', // 삼척시
  '4272000000': '5172000000', // 홍천군
  '4273000000': '5173000000', // 횡성군
  '4275000000': '5175000000', // 영월군
  '4276000000': '5176000000', // 평창군
  '4277000000': '5177000000', // 정선군
  '4278000000': '5178000000', // 철원군
  '4279000000': '5179000000', // 화천군
  '4280000000': '5180000000', // 양구군
  '4281000000': '5181000000', // 인제군
  '4282000000': '5182000000', // 고성군
  '4283000000': '5183000000', // 양양군
  // 전북특별자치도
  '4511000000': '5211000000', // 전주시
  '4511100000': '5211100000', // 전주시 완산구
  '4511300000': '5211300000', // 전주시 덕진구
  '4513000000': '5213000000', // 군산시
  '4514000000': '5214000000', // 익산시
  '4518000000': '5218000000', // 정읍시
  '4519000000': '5219000000', // 남원시
  '4521000000': '5221000000', // 김제시
  '4571000000': '5271000000', // 완주군
  '4572000000': '5272000000', // 진안군
  '4573000000': '5273000000', // 무주군
  '4574000000': '5274000000', // 장수군
  '4575000000': '5275000000', // 임실군
  '4577000000': '5277000000', // 순창군
  '4579000000': '5279000000', // 고창군
  '4580000000': '5280000000', // 부안군
}

function canonicalCode(raw: string): string {
  return LEGACY_CODE_MAP[raw] ?? raw
}

function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuote = false
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote }
    else if (ch === ',' && !inQuote) { result.push(current.trim()); current = '' }
    else { current += ch }
  }
  result.push(current.trim())
  return result
}

function parseNum(s: string): number {
  return parseInt(s.replace(/[,\s]/g, ''), 10) || 0
}

function parseMoisCSV(content: string) {
  const text = content.startsWith('﻿') ? content.slice(1) : content
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  const monthRow = splitCSVLine(lines[1])
  const months: Array<{ colOffset: number; year: number; month: number; key: string }> = []
  for (let i = 2; i < monthRow.length; i++) {
    const m = monthRow[i].match(/(\d{4})년(\d{2})월/)
    if (m) months.push({ colOffset: i, year: +m[1], month: +m[2], key: `${m[1]}${m[2]}` })
  }
  const regions: Region[] = []
  const data = new Map<string, Map<string, MonthlyStats>>()
  for (let rowIdx = 3; rowIdx < lines.length; rowIdx++) {
    const cols = splitCSVLine(lines[rowIdx])
    const rawCode = cols[0].replace(/\s/g, '')
    if (!/^\d{10}$/.test(rawCode) || rawCode.endsWith('00000000')) continue
    const sido = SIDO_BY_PREFIX[rawCode.slice(0, 2)]
    if (!sido) continue
    const code = canonicalCode(rawCode)
    // sido는 canonical code 기준으로 재산출 (구 42xx → 신 51xx 이후에도 '강원특별자치도' 유지)
    const canonicalSido = SIDO_BY_PREFIX[code.slice(0, 2)] ?? sido
    const rawName = cols[1].replace(/\s+/g, ' ').trim()
    // 시도명 접두사 제거 (구 이름 포함): rawName 에서 현재/과거 시도명 모두 시도
    let sigungu = rawName
    for (const prefix of [canonicalSido, sido]) {
      if (sigungu.startsWith(prefix)) { sigungu = sigungu.slice(prefix.length).trim(); break }
    }
    // 이미 존재하는 지역이 있으면 이름을 덮어쓰지 않음 (신 코드 CSV의 clean한 이름 우선)
    // — 파일 처리 순서가 오름차순이므로 신 코드 파일이 나중에 처리되어 자동으로 덮어씀
    regions.push({ code, sido: canonicalSido, sigungu })
    // 같은 canonical code가 한 CSV 안에 구 코드·신 코드 두 번 나올 수 있으므로 병합
    if (!data.has(code)) data.set(code, new Map())
    const monthMap = data.get(code)!
    for (const m of months) {
      const b = m.colOffset
      if (b + 4 >= cols.length) continue
      const population = parseNum(cols[b])
      if (!population) continue
      monthMap.set(m.key, { year: m.year, month: m.month, population, households: parseNum(cols[b+1]), householdSize: parseFloat(cols[b+2]) || 0, male: parseNum(cols[b+3]), female: parseNum(cols[b+4]) })
    }
  }
  return { regions, data }
}

function parseAgeCSV(content: string) {
  const text = content.startsWith('﻿') ? content.slice(1) : content
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  const monthRow = splitCSVLine(lines[1])
  const months: Array<{ colOffset: number; key: string }> = []
  for (let i = 2; i < monthRow.length; i++) {
    const m = monthRow[i].match(/(\d{4})년(\d{2})월/)
    if (m) months.push({ colOffset: i, key: `${m[1]}${m[2]}` })
  }
  const data = new Map<string, Map<string, AgeGroup[]>>()
  for (let rowIdx = 4; rowIdx < lines.length; rowIdx++) {
    const cols = splitCSVLine(lines[rowIdx])
    const rawCode = cols[0].replace(/\s/g, '')
    if (!/^\d{10}$/.test(rawCode) || rawCode.endsWith('00000000')) continue
    if (!SIDO_BY_PREFIX[rawCode.slice(0, 2)]) continue
    const code = canonicalCode(rawCode)
    const monthMap = data.get(code) ?? new Map<string, AgeGroup[]>()
    for (const { colOffset: b, key } of months) {
      if (b + 38 >= cols.length) continue
      const g = (i: number) => parseNum(cols[i] ?? '0')
      const ageGroups: AgeGroup[] = [
        { label: '0–9',   male: g(b+15), female: g(b+28) },
        { label: '10–19', male: g(b+16), female: g(b+29) },
        { label: '20–29', male: g(b+17), female: g(b+30) },
        { label: '30–39', male: g(b+18), female: g(b+31) },
        { label: '40–49', male: g(b+19), female: g(b+32) },
        { label: '50–59', male: g(b+20), female: g(b+33) },
        { label: '60–69', male: g(b+21), female: g(b+34) },
        { label: '70–79', male: g(b+22), female: g(b+35) },
        { label: '80+',   male: g(b+23)+g(b+24)+g(b+25), female: g(b+36)+g(b+37)+g(b+38) },
      ]
      if (ageGroups[0].male + ageGroups[0].female === 0) continue
      monthMap.set(key, ageGroups)
    }
    data.set(code, monthMap)
  }
  return { data }
}

// ── 메인 ─────────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data', 'raw')
const OUT_DIR  = path.join(process.cwd(), 'public', 'data', 'regions')
fs.mkdirSync(OUT_DIR, { recursive: true })

// 1. 인구/세대 CSV
const popFiles = fs.readdirSync(DATA_DIR)
  .filter(f => /^\d{4}_(first|second)_half_registered_population_and_household_monthly\.csv$/.test(f))
  .sort()

const regionMap = new Map<string, Region>()
const monthsMap = new Map<string, Map<string, MonthlyStats>>()

for (const file of popFiles) {
  const { regions, data } = parseMoisCSV(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'))
  for (const r of regions) regionMap.set(r.code, r)
  for (const [code, monthData] of data) {
    if (!monthsMap.has(code)) monthsMap.set(code, new Map())
    for (const [ym, stats] of monthData) monthsMap.get(code)!.set(ym, stats)
  }
}

// 2. 연령별 CSV
const ageFiles = fs.readdirSync(DATA_DIR)
  .filter(f => /^\d{4}_(first|second)_half_population_by_age_monthly\.csv$/.test(f))
  .sort()

const agesMap = new Map<string, Map<string, AgeGroup[]>>()

for (const file of ageFiles) {
  const { data } = parseAgeCSV(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'))
  for (const [code, ageData] of data) {
    if (!agesMap.has(code)) agesMap.set(code, new Map())
    for (const [ym, groups] of ageData) agesMap.get(code)!.set(ym, groups)
  }
}

// 3. 시군구별 JSON 생성
let count = 0
for (const [code, region] of regionMap) {
  const monthData = monthsMap.get(code)
  if (!monthData || monthData.size === 0) continue
  const months: Record<string, MonthlyStats> = {}
  for (const [ym, stats] of [...monthData.entries()].sort(([a], [b]) => a.localeCompare(b))) months[ym] = stats
  const ages: Record<string, AgeGroup[]> = {}
  const ageData = agesMap.get(code)
  if (ageData) {
    for (const [ym, groups] of [...ageData.entries()].sort(([a], [b]) => a.localeCompare(b))) ages[ym] = groups
  }
  const regionJSON: RegionJSON = { region, months, ages }
  fs.writeFileSync(path.join(OUT_DIR, `${code}.json`), JSON.stringify(regionJSON))
  count++
}

// 4. index.json
const index: Region[] = [...regionMap.values()].sort((a, b) => a.code.localeCompare(b.code))
fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index))

console.log(`✅ 완료: ${count}개 지역 JSON → public/data/regions/`)
