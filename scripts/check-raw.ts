/**
 * 원본 CSV 검사기
 * 실행: npm run check-raw
 *
 * data/raw 에 파일을 넣은 직후, `build-data` 를 돌리기 **전에** 실행한다.
 * 빌드와 분리해 둔 이유는 빌드가 출력 디렉터리를 비우기 때문이다 —
 * 원본이 잘못된 걸 빌드 도중에 알면 이미 산출물이 지워진 뒤다(docs/principles.md A5).
 *
 * 잡으려는 것은 전부 실제로 겪은 사고다.
 *   - 다운로드 형식 변경으로 파일을 한 개도 못 읽음      (docs/spec.md D14)
 *   - 연령 구간 선택이 어긋나 `0~9세`만 담긴 파일        (docs/principles.md A2)
 *   - 행정구역 개편으로 처음 보는 시도 prefix 등장       (2026.07 전남광주통합특별시)
 *   - 월 누락 / 파일 간 기간 불일치
 *   - 읍면동이 섞여 들어와 상위 단위와 이중 계상
 */

import fs from 'fs'
import path from 'path'
import {
  decodeCSV,
  parsePopulationCSV,
  parseAgeCSV,
  classifyRawFile,
  isSidoRow,
  isSigunguRow,
  AGE_BUCKETS,
} from './lib/mois-csv'
import { sidoOf, canonicalCode } from './lib/region-codes'

const DATA_DIR = path.join(process.cwd(), 'data', 'raw')

const problems: string[] = []
const notes: string[] = []
const fail = (m: string) => problems.push(m)
const note = (m: string) => notes.push(m)

// ── 1. 파일 목록 ─────────────────────────────────────────────────────────────

if (!fs.existsSync(DATA_DIR)) {
  console.error(`❌ 원본 디렉터리가 없습니다: ${DATA_DIR}`)
  process.exit(1)
}

const files = fs.readdirSync(DATA_DIR).filter(f => !f.startsWith('.')).sort()
const popFiles = files.filter(f => classifyRawFile(f) === 'population')
const ageFiles = files.filter(f => classifyRawFile(f) === 'age')
const unclassified = files.filter(f => classifyRawFile(f) === null)

console.log(`📂 data/raw — 전체 ${files.length}개 (인구·세대 ${popFiles.length} · 연령별 ${ageFiles.length})`)

if (popFiles.length === 0) fail('인구·세대 CSV 가 없습니다 (*주민등록인구및세대현황*.csv)')
if (ageFiles.length === 0) fail('연령별 CSV 가 없습니다 (*연령별인구현황*.csv)')
for (const f of unclassified) note(`분류되지 않은 파일: ${f}`)

// macOS 는 파일명을 NFD 로 저장한다. 정규화 후 같은 이름이 둘 있으면
// 덮어쓰기를 기대했는데 두 벌이 공존하는 상태다.
const seen = new Map<string, string[]>()
for (const f of files) {
  const key = f.normalize('NFC')
  seen.set(key, [...(seen.get(key) ?? []), f])
}
for (const [key, group] of seen) {
  if (group.length > 1) fail(`파일명 중복(정규화 후 동일): ${key} — ${group.length}개`)
}

// ── 2. 월 커버리지 ───────────────────────────────────────────────────────────

const read = (f: string) => decodeCSV(fs.readFileSync(path.join(DATA_DIR, f)))

function monthSpan(kind: '인구·세대' | '연령별', months: string[]) {
  if (months.length === 0) { fail(`${kind}: 월을 하나도 읽지 못했습니다`); return }
  const first = months[0], last = months.at(-1)!
  // 연속성 확인
  const expected: string[] = []
  let y = +first.slice(0, 4), m = +first.slice(4)
  while (`${y}${String(m).padStart(2, '0')}` <= last) {
    expected.push(`${y}${String(m).padStart(2, '0')}`)
    m++; if (m > 12) { m = 1; y++ }
  }
  const missing = expected.filter(e => !months.includes(e))
  console.log(`   ${kind}: ${first}~${last} (${months.length}개월)`)
  if (missing.length > 0) fail(`${kind}: 중간에 빠진 달 — ${missing.join(', ')}`)
}

const popMonths = new Set<string>()
const ageMonths = new Set<string>()
const codesByMonth = new Map<string, Set<string>>()
let eupMyeonDong = 0
const unknownPrefix = new Map<string, string>()
const sidoTotalByMonth = new Map<string, number>()
const ourTotalByMonth = new Map<string, number>()

for (const f of popFiles) {
  const { rows, months, unknownFields } = parsePopulationCSV(read(f))
  months.forEach(m => popMonths.add(m))
  if (unknownFields.length > 0) note(`${f}: 처음 보는 컬럼 — ${unknownFields.join(', ')}`)
  if (rows.length === 0) fail(`${f}: 데이터 행이 없습니다`)

  for (const row of rows) {
    if (isSidoRow(row.code)) {
      for (const [ym, s] of row.months) {
        sidoTotalByMonth.set(ym, (sidoTotalByMonth.get(ym) ?? 0) + s.population)
      }
      continue
    }
    if (!isSigunguRow(row.code)) { eupMyeonDong++; continue }
    if (!sidoOf(row.code)) unknownPrefix.set(row.code.slice(0, 2), row.name)

    const code = canonicalCode(row.code)
    for (const [ym, s] of row.months) {
      if (!codesByMonth.has(ym)) codesByMonth.set(ym, new Set())
      codesByMonth.get(ym)!.add(code)
      ourTotalByMonth.set(ym, (ourTotalByMonth.get(ym) ?? 0) + s.population)
    }
  }
}

for (const f of ageFiles) {
  const { rows, months, incompleteMonths, sourceLowerBounds } = parseAgeCSV(read(f))
  months.forEach(m => ageMonths.add(m))
  if (rows.length === 0) fail(`${f}: 데이터 행이 없습니다`)
  if (incompleteMonths.length > 0) {
    fail(
      `${f}: 연령 구간이 불완전한 달 — ${incompleteMonths.join(', ')}\n` +
      `        ${AGE_BUCKETS.length}개 버킷이 모두 있어야 합니다. 받은 구간 하한: ${sourceLowerBounds.join(',')}`,
    )
  }
}

console.log('\n📅 기간')
monthSpan('인구·세대', [...popMonths].sort())
monthSpan('연령별', [...ageMonths].sort())

// 연령 데이터는 인구보다 한 달 뒤처지는 것이 정상이다(MOIS 공표 일정).
const popLast = [...popMonths].sort().at(-1)
const ageLast = [...ageMonths].sort().at(-1)
if (popLast && ageLast && ageLast > popLast) {
  fail(`연령 데이터(${ageLast})가 인구 데이터(${popLast})보다 앞섭니다 — 파일을 확인하세요`)
}

// ── 3. 지역 구성 ─────────────────────────────────────────────────────────────

console.log('\n🗺  지역')
if (eupMyeonDong > 0) {
  fail(`읍면동 행 ${eupMyeonDong}개가 섞여 있습니다 — 시군구 단위로 다시 내려받으세요`)
}
for (const [prefix, name] of unknownPrefix) {
  fail(
    `처음 보는 시도 prefix '${prefix}' (${name})\n` +
    `        행정구역 개편일 수 있습니다. scripts/lib/region-codes.ts 의\n` +
    `        SIDO_BY_PREFIX·LEGACY_CODE_MAP 을 갱신하세요.`,
  )
}

const sortedPopMonths = [...popMonths].sort()
const counts = sortedPopMonths.map(ym => codesByMonth.get(ym)?.size ?? 0)
console.log(`   시군구 수: ${Math.min(...counts)}~${Math.max(...counts)}개 (월별)`)

// 지역 수가 달마다 크게 흔들리면 개편이거나 파일이 잘린 것이다.
for (let i = 1; i < sortedPopMonths.length; i++) {
  const delta = counts[i] - counts[i - 1]
  if (Math.abs(delta) >= 3) {
    note(`${sortedPopMonths[i - 1]}→${sortedPopMonths[i]}: 시군구 수 ${delta > 0 ? '+' : ''}${delta} — 개편 여부 확인`)
  }
}

// ── 4. 합계 대조 ─────────────────────────────────────────────────────────────
// 시도 합계 행은 MOIS 가 직접 집계한 값이다. 우리가 시군구를 더한 값과 맞아야 한다.
// 일반구가 섞이면 여기서 크게 벌어진다 (docs/principles.md A3-1).

console.log('\n🔢 합계 대조 (시도 합계 행 기준)')
let worst = 0
for (const ym of sortedPopMonths) {
  const official = sidoTotalByMonth.get(ym)
  const ours = ourTotalByMonth.get(ym)
  if (!official || !ours) continue
  // ours 에는 일반구가 포함되어 있으므로 official 보다 크다. 그 비율을 본다.
  const ratio = ours / official - 1
  worst = Math.max(worst, Math.abs(ratio))
}
const lastYm = sortedPopMonths.at(-1)!
console.log(`   ${lastYm}: 시도 합계 ${(sidoTotalByMonth.get(lastYm) ?? 0).toLocaleString()}`)
console.log(`   ※ 원본 행 단순 합(일반구 포함)이라 초과가 정상입니다. 최대 편차 ${(worst * 100).toFixed(1)}%`)
console.log('   계층을 반영한 정확한 대조는 build-data 출력과 npm run test 가 수행합니다.')

// ── 결과 ─────────────────────────────────────────────────────────────────────

console.log('')
for (const n of notes) console.log(`ℹ️  ${n}`)
if (problems.length === 0) {
  console.log('✅ 원본 검사 통과 — npm run build-data 를 실행하세요.')
} else {
  console.log(`❌ 문제 ${problems.length}건`)
  for (const p of problems) console.log(`   • ${p}`)
  process.exit(1)
}
