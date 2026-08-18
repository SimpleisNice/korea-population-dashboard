/**
 * CSV → JSON 변환 스크립트
 * 실행: npm run build-data (dev/build/test 전에 자동 실행됨)
 *
 * data/raw/*.csv 를 읽어 public/data/regions/ 에 시군구별 JSON 파일 생성
 *   - public/data/regions/index.json   (전체 지역 목록)
 *   - public/data/regions/[code].json  (지역별 통계)
 *
 * 파싱 로직은 scripts/lib/mois-csv.ts, 행정 코드 체계는 scripts/lib/region-codes.ts 에 있다.
 * 이 파일은 파일 읽기·병합·계층 판별·쓰기만 담당한다.
 *
 * 빌드/개발 시점에만 실행되고 런타임에는 돌지 않는다.
 */

import fs from 'fs'
import path from 'path'
import {
  decodeCSV,
  parsePopulationCSV,
  parseAgeCSV,
  classifyRawFile,
  isSigunguRow,
  isSidoRow,
  type MonthlyStats,
  type AgeGroup,
} from './lib/mois-csv'
import {
  canonicalCode,
  sidoOf,
  stripSidoPrefix,
  SPLIT_SUCCESSORS,
} from './lib/region-codes'

// ── 타입 ─────────────────────────────────────────────────────────────────────

type RegionLevel = 'sigungu' | 'district'

interface Region {
  code: string
  sido: string
  sigungu: string
  level: RegionLevel
  /** 개편으로 폐지된 지역의 마지막 데이터 월. 현행 지역에는 없다. */
  retiredAfter?: string
  /** 폐지 지역을 승계한 현행 지역 코드들. */
  successorCodes?: string[]
}

/** level·retired 는 전체 목록이 모여야 판별할 수 있어 파싱 단계에서는 제외한다. */
type RegionRaw = Pick<Region, 'code' | 'sido' | 'sigungu'>

interface RegionJSON {
  region: Region
  months: Record<string, MonthlyStats>
  ages: Record<string, AgeGroup[]>
}

// ── 경로 ─────────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data', 'raw')
const OUT_DIR = path.join(process.cwd(), 'public', 'data', 'regions')

/** 계층 판별이 조용히 어긋나는 것을 막는 가드. 개편으로 바뀌면 확인 후 갱신한다. */
const EXPECTED_ACTIVE_TOP_LEVEL = 230

function fail(message: string): never {
  console.error(`\n❌ build-data 중단: ${message}\n`)
  process.exit(1)
}

// ── 1. 원본 파일 수집 ────────────────────────────────────────────────────────

if (!fs.existsSync(DATA_DIR)) fail(`원본 디렉터리가 없습니다: ${DATA_DIR}`)

const allFiles = fs.readdirSync(DATA_DIR).sort()
const popFiles = allFiles.filter(f => classifyRawFile(f) === 'population')
const ageFiles = allFiles.filter(f => classifyRawFile(f) === 'age')

// 읽은 파일이 0개면 출력 디렉터리를 비우기 **전에** 실패시킨다.
// 이 순서를 뒤집으면 형식이 안 맞을 때 커밋된 산출물을 지우고 빈 index 만 남긴다
// (docs/spec.md D14 가 정확히 그 상태였다 — docs/principles.md A5).
if (popFiles.length === 0) {
  fail(
    `data/raw 에서 인구·세대 CSV 를 찾지 못했습니다 (전체 ${allFiles.length}개 파일).\n` +
    `   기대하는 파일명: *주민등록인구및세대현황*.csv\n` +
    `   MOIS 다운로드 형식이 바뀌었을 수 있습니다. npm run check-raw 로 확인하세요.`,
  )
}
if (ageFiles.length === 0) {
  fail(
    `data/raw 에서 연령별 CSV 를 찾지 못했습니다.\n` +
    `   기대하는 파일명: *연령별인구현황*.csv`,
  )
}

const read = (file: string) => decodeCSV(fs.readFileSync(path.join(DATA_DIR, file)))

// ── 2. 인구·세대 파싱 ────────────────────────────────────────────────────────

const regionMap = new Map<string, RegionRaw>()
const monthsMap = new Map<string, Map<string, MonthlyStats>>()
/** 시도 합계 행. 집계 대상은 아니지만 검증 기준값으로 출력한다. */
const sidoTotals = new Map<string, number>()
let droppedEupMyeonDong = 0
const unknownPrefixes = new Set<string>()

for (const file of popFiles) {
  const { rows, unknownFields } = parsePopulationCSV(read(file))
  if (unknownFields.length > 0) {
    console.warn(`⚠️  ${file}: 알 수 없는 컬럼 ${unknownFields.join(', ')}`)
  }

  for (const row of rows) {
    if (isSidoRow(row.code)) {
      for (const [ym, stats] of row.months) {
        sidoTotals.set(ym, (sidoTotals.get(ym) ?? 0) + stats.population)
      }
      continue
    }
    // 읍면동이 섞여 들어오면(다운로드 설정 실수) 상위 단위와 이중 계상된다.
    if (!isSigunguRow(row.code)) { droppedEupMyeonDong++; continue }

    const rawSido = sidoOf(row.code)
    if (!rawSido) { unknownPrefixes.add(row.code.slice(0, 2)); continue }

    const code = canonicalCode(row.code)
    // 시도명은 canonical code 기준으로 재산출한다.
    // 구 42xx 행도 병합 후에는 '강원특별자치도'로 표기되어야 한다.
    const sido = sidoOf(code) ?? rawSido
    let sigungu = stripSidoPrefix(row.name, sido, rawSido)
    // 하위 시군구가 없는 시도(세종특별자치시)는 접두사를 떼면 빈 문자열이 된다.
    // 빈 sigungu 는 /[sido]/[sigungu] 라우트를 만들 수 없어 404 가 되므로 시도명으로 채운다.
    if (!sigungu) sigungu = sido

    // 신 코드 파일이 나중에 처리되므로 이름은 자연히 현행 표기로 덮어써진다.
    regionMap.set(code, { code, sido, sigungu })

    if (!monthsMap.has(code)) monthsMap.set(code, new Map())
    const target = monthsMap.get(code)!
    for (const [ym, stats] of row.months) target.set(ym, stats)
  }
}

if (unknownPrefixes.size > 0) {
  fail(
    `알 수 없는 시도 prefix: ${[...unknownPrefixes].join(', ')}\n` +
    `   행정구역 개편일 수 있습니다. scripts/lib/region-codes.ts 의 SIDO_BY_PREFIX 와\n` +
    `   LEGACY_CODE_MAP 을 갱신하세요. 방치하면 해당 지역이 통째로 누락됩니다.`,
  )
}

// ── 3. 연령별 파싱 ───────────────────────────────────────────────────────────

const agesMap = new Map<string, Map<string, AgeGroup[]>>()
const incompleteAgeMonths = new Set<string>()
const sourceBounds = new Set<number>()

for (const file of ageFiles) {
  const { rows, incompleteMonths, sourceLowerBounds } = parseAgeCSV(read(file))
  incompleteMonths.forEach(m => incompleteAgeMonths.add(m))
  sourceLowerBounds.forEach(b => sourceBounds.add(b))

  for (const row of rows) {
    if (!isSigunguRow(row.code)) continue
    if (!sidoOf(row.code)) continue
    const code = canonicalCode(row.code)
    if (!agesMap.has(code)) agesMap.set(code, new Map())
    const target = agesMap.get(code)!
    for (const [ym, groups] of row.months) target.set(ym, groups)
  }
}

if (incompleteAgeMonths.size > 0) {
  fail(
    `연령 구간이 불완전한 달: ${[...incompleteAgeMonths].sort().join(', ')}\n` +
    `   0~9세부터 80세 이상까지 9개 구간이 모두 있어야 합니다.\n` +
    `   MOIS 조회에서 연령 구간을 다시 선택해 내려받으세요 (docs/principles.md A2).`,
  )
}

// ── 4. 통계가 있는 지역만 남긴다 ─────────────────────────────────────────────
// 출장소처럼 CSV 에 행은 있지만 인구 수치가 없는 항목이 index 에 남으면
// 검색 결과에는 뜨는데 클릭하면 404 가 된다 (docs/principles.md A4).

const withData: RegionRaw[] = [...regionMap.values()]
  .filter(r => (monthsMap.get(r.code)?.size ?? 0) > 0)
  .sort((a, b) => a.code.localeCompare(b.code))

const droppedNoData = regionMap.size - withData.length
if (withData.length === 0) fail('인구 데이터가 있는 지역이 하나도 없습니다.')

// ── 5. 행정 계층(level) 판별 ─────────────────────────────────────────────────
// 일반구는 ① 부모 시 코드(앞 4자리 + '000000')가 목록에 있고
//          ② 자기 이름이 '<부모명> ' 으로 시작한다.
// ①만 쓰면 영동군(4374000000)/증평군(4374500000)처럼 코드 앞자리만 우연히 겹치는
// 별개 지역을 잘못 묶는다. 두 조건을 모두 만족할 때만 일반구로 본다.

const rawByCode = new Map(withData.map(r => [r.code, r]))

function parentOf(r: RegionRaw): RegionRaw | null {
  const parent = rawByCode.get(`${r.code.slice(0, 4)}000000`)
  if (!parent || parent.code === r.code) return null
  return r.sigungu.startsWith(`${parent.sigungu} `) ? parent : null
}

// ── 6. 폐지 지역 판별 ────────────────────────────────────────────────────────
// 분할 개편(1:N)은 시계열을 병합할 수 없다. 구 지역의 이력은 그대로 보존하고
// 폐지 사실과 승계 지역만 표기한다 (region-codes.ts SPLIT_SUCCESSORS 참고).

const lastMonthOf = (code: string) =>
  [...(monthsMap.get(code)?.keys() ?? [])].sort().at(-1) ?? ''

const latestMonth = withData.map(r => lastMonthOf(r.code)).sort().at(-1)!

const index: Region[] = withData.map(r => {
  const region: Region = { ...r, level: parentOf(r) ? 'district' : 'sigungu' }
  const successors = SPLIT_SUCCESSORS[r.code]
  const last = lastMonthOf(r.code)
  if (successors && last < latestMonth) {
    region.retiredAfter = last
    region.successorCodes = successors.filter(c => rawByCode.has(c))
  }
  return region
})

// 선언되지 않은 지역이 최신월을 갖지 못하면 사람이 확인해야 한다.
// 개편일 수도, 단순 결측일 수도 있어 자동으로 '폐지'라고 단정하지 않는다.
const silentlyStale = index
  .filter(r => !r.retiredAfter && lastMonthOf(r.code) < latestMonth)
  .map(r => `${r.sido} ${r.sigungu}(${r.code}, ~${lastMonthOf(r.code)})`)

if (silentlyStale.length > 0) {
  console.warn(
    `⚠️  최신월(${latestMonth}) 데이터가 없는 지역 ${silentlyStale.length}개:\n` +
    silentlyStale.map(s => `      ${s}`).join('\n') +
    `\n   행정구역 개편이라면 region-codes.ts 에 매핑을 추가하세요.` +
    `\n   순위·전국 합계에서는 자동 제외되지만, 방치하면 유령 지역이 됩니다.`,
  )
}

// ── 7. 출력 ──────────────────────────────────────────────────────────────────
// 출력 디렉터리를 매번 비운다. 그러지 않으면 개편으로 사라진 구 코드 JSON 이
// 계속 남아 저장소를 오염시킨다 (docs/principles.md A4).
// 여기까지 왔다면 쓸 데이터가 확보된 상태다 — 위의 fail() 들이 그것을 보장한다.

fs.rmSync(OUT_DIR, { recursive: true, force: true })
fs.mkdirSync(OUT_DIR, { recursive: true })

const sortEntries = <T>(m: Map<string, T> | undefined): Record<string, T> => {
  const out: Record<string, T> = {}
  for (const [k, v] of [...(m?.entries() ?? [])].sort(([a], [b]) => a.localeCompare(b))) out[k] = v
  return out
}

for (const region of index) {
  const json: RegionJSON = {
    region,
    months: sortEntries(monthsMap.get(region.code)),
    ages: sortEntries(agesMap.get(region.code)),
  }
  fs.writeFileSync(path.join(OUT_DIR, `${region.code}.json`), JSON.stringify(json))
}

fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index))

// ── 8. 요약과 가드 ───────────────────────────────────────────────────────────

const retired = index.filter(r => r.retiredAfter)
const districts = index.filter(r => r.level === 'district')
const activeTopLevel = index.filter(r => r.level === 'sigungu' && !r.retiredAfter)
const allMonths = [...new Set([...monthsMap.values()].flatMap(m => [...m.keys()]))].sort()

console.log(`✅ 완료: ${index.length}개 지역 JSON → public/data/regions/`)
console.log(`   최상위 시군구 ${activeTopLevel.length} · 일반구 ${districts.length}` +
  (retired.length > 0 ? ` · 폐지 ${retired.length}` : '') +
  (droppedNoData > 0 ? ` · 통계 없어 제외 ${droppedNoData}` : '') +
  (droppedEupMyeonDong > 0 ? ` · 읍면동 제외 ${droppedEupMyeonDong}` : ''))
console.log(`   기간 ${allMonths[0]}~${allMonths.at(-1)} (${allMonths.length}개월)` +
  ` · 연령 원본 구간 하한 ${[...sourceBounds].sort((a, b) => a - b).join(',')}`)

const ourTotal = index
  .filter(r => r.level === 'sigungu' && !r.retiredAfter)
  .reduce((s, r) => s + (monthsMap.get(r.code)?.get(latestMonth)?.population ?? 0), 0)
const official = sidoTotals.get(latestMonth) ?? 0
if (official > 0) {
  const diff = ((ourTotal / official - 1) * 100).toFixed(3)
  console.log(`   ${latestMonth} 전국 합계 ${ourTotal.toLocaleString()} ` +
    `vs 시도 합계 행 ${official.toLocaleString()} (${diff}%)`)
}

for (const r of retired) {
  const names = (r.successorCodes ?? [])
    .map(c => rawByCode.get(c)?.sigungu ?? c).join('·')
  console.log(`   ↪︎ 폐지: ${r.sido} ${r.sigungu} (~${r.retiredAfter}) → ${names}`)
}

if (activeTopLevel.length !== EXPECTED_ACTIVE_TOP_LEVEL) {
  console.warn(
    `\n⚠️  현행 최상위 시군구가 ${activeTopLevel.length}개입니다 ` +
    `(기대값 ${EXPECTED_ACTIVE_TOP_LEVEL}).\n` +
    `   행정구역 개편이라면 region-codes.ts 의 매핑과 이 기대값을 함께 갱신하세요.`,
  )
}
