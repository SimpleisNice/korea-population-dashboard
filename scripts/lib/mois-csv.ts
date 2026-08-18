/**
 * MOIS 주민등록 인구통계 CSV 파서
 *
 * 순수 함수만 둔다. 파일 시스템 접근과 JSON 생성은 csv-to-json.ts,
 * 원본 검사는 check-raw.ts 가 담당한다. 이 분리는 파서 단위 테스트를 위한 것이다
 * (docs/principles.md A5 — 산출물 검사만으로는 파싱 결함을 못 잡는다).
 *
 * ── 대상 형식 (2026-08 MOIS 포털 다운로드) ──────────────────────────────────
 *   "행정구역","2026년07월_거주자 인구수","2026년07월_세대수",...   ← 1행이 헤더 전부
 *   "서울특별시  (1100000000)","9,218,911","4,476,667",...        ← 2행부터 데이터
 *
 * 인코딩은 CP949, 지역 코드는 이름 안에 결합되어 있고, 월과 항목이 한 컬럼명에 붙어 있다.
 * 구 형식(UTF-8·헤더 3~4행·코드 별도 컬럼)은 지원하지 않는다 — data/raw 에서 제거됐고
 * 쓰이지 않는 분기를 남기지 않는다(docs/principles.md C5). 필요하면 git 이력에 있다.
 *
 * ── 설계 규칙 ────────────────────────────────────────────────────────────────
 * 컬럼은 **이름으로 찾는다.** 위치 오프셋(`cols[b+15]`)을 쓰면 헤더가 한 칸 움직였을 때
 * 예외 없이 조용히 다른 값을 읽는다. 그래서 월 개수·연령 구간 폭이 달라져도 동작한다.
 */

// ── 인코딩 ───────────────────────────────────────────────────────────────────

const UTF8_BOM = [0xef, 0xbb, 0xbf]

/**
 * CSV 바이트를 문자열로 디코딩한다.
 *
 * MOIS 포털은 CP949(EUC-KR)로 내보내지만 과거 파일이나 재저장본은 UTF-8일 수 있다.
 * BOM 이 있으면 UTF-8, 없으면 UTF-8 로 디코딩해 치환 문자(U+FFFD)가 나오는지로 판별한다.
 * CP949 바이트열은 UTF-8 로 읽으면 반드시 깨지므로 이 판별이 성립한다.
 */
export function decodeCSV(buf: Uint8Array): string {
  if (UTF8_BOM.every((b, i) => buf[i] === b)) {
    return new TextDecoder('utf-8').decode(buf.subarray(3))
  }
  const asUtf8 = new TextDecoder('utf-8').decode(buf)
  if (!asUtf8.includes('�')) return asUtf8
  return new TextDecoder('euc-kr').decode(buf)
}

// ── 행 분해 ──────────────────────────────────────────────────────────────────

/** 따옴표 안의 콤마("1,234,567")를 보존하며 CSV 한 줄을 분해한다. */
export function splitCSVLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (const ch of line) {
    if (ch === '"') quoted = !quoted
    else if (ch === ',' && !quoted) { out.push(cur.trim()); cur = '' }
    else cur += ch
  }
  out.push(cur.trim())
  return out
}

/** "1,234,567" → 1234567. 빈칸·하이픈 등 숫자가 아닌 값은 null. */
export function parseNum(s: string | undefined): number | null {
  if (s === undefined) return null
  const cleaned = s.replace(/[,\s]/g, '')
  if (!/^-?\d+$/.test(cleaned)) return null
  return parseInt(cleaned, 10)
}

/** "2.06" → 2.06. 숫자가 아니면 null. */
export function parseFloatCell(s: string | undefined): number | null {
  if (s === undefined) return null
  const cleaned = s.replace(/[,\s]/g, '')
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null
  return parseFloat(cleaned)
}

/**
 * 행정구역 셀에서 코드와 이름을 분리한다.
 * "서울특별시 종로구 (1111000000)" → { code: '1111000000', name: '서울특별시 종로구' }
 *
 * macOS 파일명·CSV 내용 모두 자모 분리(NFD)로 들어올 수 있어 NFC 로 정규화한다.
 * 정규화하지 않으면 '연령별' 같은 문자열 비교가 조용히 실패한다.
 */
export function parseRegionCell(cell: string): { code: string; name: string } | null {
  const m = cell.match(/\((\d{10})\)\s*$/)
  if (!m) return null
  return {
    code: m[1],
    name: cell.slice(0, m.index).normalize('NFC').replace(/\s+/g, ' ').trim(),
  }
}

// ── 헤더 ─────────────────────────────────────────────────────────────────────

export interface ColumnRef {
  /** 'YYYYMM' */
  ym: string
  /** 월 접두사를 뗀 나머지. 예: '세대수', '남_거주자_0~9세' */
  field: string
  index: number
}

/** 헤더 셀을 { ym, field, index } 로 분해한다. 월 패턴이 없는 셀(행정구역)은 건너뛴다. */
export function parseHeader(cells: string[]): ColumnRef[] {
  const out: ColumnRef[] = []
  cells.forEach((raw, index) => {
    const cell = raw.normalize('NFC')
    const m = cell.match(/^(\d{4})년(\d{2})월_(.+)$/)
    if (m) out.push({ ym: `${m[1]}${m[2]}`, field: m[3].trim(), index })
  })
  return out
}

/** 헤더에 등장하는 연월을 오름차순으로 돌려준다. */
export function monthsOf(cols: ColumnRef[]): string[] {
  return [...new Set(cols.map(c => c.ym))].sort()
}

// ── 인구·세대 CSV ────────────────────────────────────────────────────────────

export interface MonthlyStats {
  population: number
  households: number
  householdSize: number
  male: number
  female: number
}

export interface ParsedRegionRow {
  code: string
  name: string
  months: Map<string, MonthlyStats>
}

/** 월당 컬럼 라벨. MOIS 가 라벨을 바꾸면 여기만 고친다. */
const POP_FIELDS = {
  population: '거주자 인구수',
  households: '세대수',
  householdSize: '세대당 인구',
  male: '남자 인구수',
  female: '여자 인구수',
} as const

/**
 * 존재는 하지만 쓰지 않는 컬럼. `unknownFields` 경고에서 제외한다.
 * 경고가 매번 뜨면 진짜 형식 변경 신호를 못 알아본다.
 */
const POP_IGNORED_FIELDS = new Set(['남여 비율'])

export interface PopulationParseResult {
  rows: ParsedRegionRow[]
  months: string[]
  /** 헤더에 있으나 기대 라벨과 맞지 않는 필드. 형식 변경 감지용. */
  unknownFields: string[]
}

export function parsePopulationCSV(text: string): PopulationParseResult {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return { rows: [], months: [], unknownFields: [] }

  const cols = parseHeader(splitCSVLine(lines[0]))
  const months = monthsOf(cols)

  const known = new Set<string>(Object.values(POP_FIELDS))
  const unknownFields = [...new Set(
    cols.map(c => c.field).filter(f => !known.has(f) && !POP_IGNORED_FIELDS.has(f)),
  )]

  // ym → 필드별 컬럼 인덱스
  const byMonth = new Map<string, Partial<Record<keyof typeof POP_FIELDS, number>>>()
  for (const c of cols) {
    const key = (Object.keys(POP_FIELDS) as (keyof typeof POP_FIELDS)[])
      .find(k => POP_FIELDS[k] === c.field)
    if (!key) continue
    if (!byMonth.has(c.ym)) byMonth.set(c.ym, {})
    byMonth.get(c.ym)![key] = c.index
  }

  const rows: ParsedRegionRow[] = []
  for (const line of lines.slice(1)) {
    const cells = splitCSVLine(line)
    const region = parseRegionCell(cells[0] ?? '')
    if (!region) continue

    const monthMap = new Map<string, MonthlyStats>()
    for (const [ym, idx] of byMonth) {
      if (idx.population === undefined) continue
      const population = parseNum(cells[idx.population])
      // 값이 비어 있는 달은 그 지역이 아직/이미 존재하지 않는 달이다.
      // 행정구역 개편월에는 구 코드와 신 코드가 한 파일에 함께 나오며
      // 서로 겹치지 않는 달을 채우고 있다 — 빈칸을 0으로 읽으면 이 구조가 무너진다.
      if (population === null || population === 0) continue
      monthMap.set(ym, {
        population,
        households: parseNum(cells[idx.households ?? -1]) ?? 0,
        householdSize: parseFloatCell(cells[idx.householdSize ?? -1]) ?? 0,
        male: parseNum(cells[idx.male ?? -1]) ?? 0,
        female: parseNum(cells[idx.female ?? -1]) ?? 0,
      })
    }
    rows.push({ code: region.code, name: region.name, months: monthMap })
  }

  return { rows, months, unknownFields }
}

// ── 연령별 CSV ───────────────────────────────────────────────────────────────

export interface AgeGroup {
  label: string
  male: number
  female: number
}

/** 출력 버킷: 10세 단위 9개. 80세 이상은 하나로 합친다. */
export const AGE_BUCKETS = [
  '0–9', '10–19', '20–29', '30–39', '40–49', '50–59', '60–69', '70–79', '80+',
] as const

/**
 * 원본 연령 라벨에서 구간 하한을 뽑는다.
 *   '0~9세' → 0 · '100세 이상' → 100 · '5~9세' → 5
 * 하한만 쓰므로 원본이 5세 단위여도 그대로 동작한다.
 *
 * 반드시 **첫** 숫자를 잡아야 한다. `/(\d+)\s*세/` 로 쓰면 '0~9세'에서 9(상한)를
 * 읽는다. 10세 단위에서는 우연히 같은 버킷에 떨어져 증상이 없지만, 이름과 값이
 * 어긋난 채로 남으면 구간 폭이 바뀌는 순간 조용히 틀린다.
 */
export function ageLowerBound(label: string): number | null {
  const m = label.match(/^\s*(\d+)/)
  return m ? parseInt(m[1], 10) : null
}

/** 구간 하한 → 출력 버킷 인덱스. 80 이상은 모두 마지막 버킷(80+)으로 접는다. */
export function bucketIndexOf(lowerBound: number): number {
  return Math.min(Math.floor(lowerBound / 10), AGE_BUCKETS.length - 1)
}

/** 연령 컬럼 라벨을 성별과 구간으로 분해한다. 집계 컬럼(총인구수·연령구간인구수)은 null. */
export function parseAgeField(field: string): { gender: 'total' | 'male' | 'female'; lowerBound: number } | null {
  let rest = field
  let gender: 'total' | 'male' | 'female' = 'total'
  if (rest.startsWith('남_')) { gender = 'male'; rest = rest.slice(2) }
  else if (rest.startsWith('여_')) { gender = 'female'; rest = rest.slice(2) }
  // '거주자_0~9세' → '0~9세'
  const bucket = rest.replace(/^거주자_/, '')
  if (/총인구수|연령구간인구수/.test(bucket)) return null
  const lowerBound = ageLowerBound(bucket)
  return lowerBound === null ? null : { gender, lowerBound }
}

export interface ParsedAgeRow {
  code: string
  name: string
  months: Map<string, AgeGroup[]>
}

export interface AgeParseResult {
  rows: ParsedAgeRow[]
  months: string[]
  /** 연령 구간이 0~80+ 전 범위를 덮지 못하는 달. 다운로드 설정 실수 감지용. */
  incompleteMonths: string[]
  /** 원본 구간 하한 목록(오름차순). 5세 단위로 받았는지 확인할 때 쓴다. */
  sourceLowerBounds: number[]
}

/**
 * 연령별 CSV 를 파싱해 10세 단위 9버킷으로 재집계한다.
 *
 * `incompleteMonths` 는 조용한 데이터 손상을 막는 장치다 — 2026-08 에 MOIS 조회에서
 * 구간 선택이 어긋나 `0~9세` 만 담긴 파일이 들어온 적이 있다(docs/principles.md A2).
 */
export function parseAgeCSV(text: string): AgeParseResult {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) {
    return { rows: [], months: [], incompleteMonths: [], sourceLowerBounds: [] }
  }

  const cols = parseHeader(splitCSVLine(lines[0]))
  const months = monthsOf(cols)

  // ym → 버킷 인덱스 → 성별 → 컬럼 인덱스들
  type Slot = { male: number[]; female: number[] }
  const byMonth = new Map<string, Slot[]>()
  const lowerBounds = new Set<number>()
  const coverageByMonth = new Map<string, Set<number>>()

  for (const c of cols) {
    const parsed = parseAgeField(c.field)
    if (!parsed || parsed.gender === 'total') continue
    lowerBounds.add(parsed.lowerBound)
    if (!coverageByMonth.has(c.ym)) coverageByMonth.set(c.ym, new Set())
    coverageByMonth.get(c.ym)!.add(bucketIndexOf(parsed.lowerBound))

    if (!byMonth.has(c.ym)) {
      byMonth.set(c.ym, AGE_BUCKETS.map(() => ({ male: [], female: [] })))
    }
    byMonth.get(c.ym)![bucketIndexOf(parsed.lowerBound)][parsed.gender].push(c.index)
  }

  // 9개 버킷을 모두 덮지 못하는 달을 골라낸다.
  const incompleteMonths = months.filter(
    ym => (coverageByMonth.get(ym)?.size ?? 0) < AGE_BUCKETS.length,
  )

  const rows: ParsedAgeRow[] = []
  for (const line of lines.slice(1)) {
    const cells = splitCSVLine(line)
    const region = parseRegionCell(cells[0] ?? '')
    if (!region) continue

    const monthMap = new Map<string, AgeGroup[]>()
    for (const [ym, slots] of byMonth) {
      const groups: AgeGroup[] = slots.map((slot, i) => ({
        label: AGE_BUCKETS[i],
        male: slot.male.reduce((s, idx) => s + (parseNum(cells[idx]) ?? 0), 0),
        female: slot.female.reduce((s, idx) => s + (parseNum(cells[idx]) ?? 0), 0),
      }))
      // 전 구간이 0이면 그 지역·그 달에는 데이터가 없다(개편 전후 빈 행).
      if (groups.every(g => g.male === 0 && g.female === 0)) continue
      monthMap.set(ym, groups)
    }
    rows.push({ code: region.code, name: region.name, months: monthMap })
  }

  return {
    rows,
    months,
    incompleteMonths,
    sourceLowerBounds: [...lowerBounds].sort((a, b) => a - b),
  }
}

// ── 파일 분류 ────────────────────────────────────────────────────────────────

export type RawFileKind = 'population' | 'age'

/**
 * 파일명으로 CSV 종류를 판별한다.
 *
 * macOS(APFS)는 파일명을 NFD 로 저장하므로 반드시 NFC 정규화 후 비교한다.
 * 정규화 없이 '연령별'.includes() 를 쓰면 항상 false 가 되어 파일을 조용히 놓친다.
 */
export function classifyRawFile(filename: string): RawFileKind | null {
  const n = filename.normalize('NFC')
  if (!n.endsWith('.csv')) return null
  if (n.includes('연령별인구현황')) return 'age'
  if (n.includes('주민등록인구및세대현황')) return 'population'
  return null
}

// ── 행정 코드 ────────────────────────────────────────────────────────────────

/** 시도 합계 행인가. 집계 대상에서 제외하되 검증 기준값으로 쓴다. */
export function isSidoRow(code: string): boolean {
  return code.endsWith('00000000')
}

/**
 * 시군구·일반구 행인가.
 * 뒤 5자리가 '00000' 이 아니면 읍면동이다 — 다운로드 설정을 잘못하면 섞여 들어온다.
 */
export function isSigunguRow(code: string): boolean {
  return code.endsWith('00000') && !isSidoRow(code)
}
