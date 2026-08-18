/**
 * CSV 파서 단위 테스트 (docs/backlog.md P1-7)
 *
 * 빌드 산출물 검사(src/lib/data.test.ts)만으로는 파싱 결함을 못 잡는다는 것이
 * 2026-08 형식 변경에서 드러났다 — 파서가 파일을 0개 읽어도 산출물 테스트는
 * "산출물이 일관적이다"라고 통과할 수 있다(docs/principles.md A5).
 *
 * 여기서는 실제 원본 파일이 아니라 **고정된 입력 문자열**을 쓴다.
 * 원본 데이터가 바뀌어도 파싱 규칙 자체의 회귀를 잡기 위함이다.
 */
import { describe, it, expect } from 'vitest'
import {
  splitCSVLine,
  parseNum,
  parseFloatCell,
  parseRegionCell,
  parseHeader,
  monthsOf,
  parsePopulationCSV,
  parseAgeCSV,
  parseAgeField,
  ageLowerBound,
  bucketIndexOf,
  classifyRawFile,
  isSidoRow,
  isSigunguRow,
  decodeCSV,
  AGE_BUCKETS,
} from './mois-csv'

describe('행 분해', () => {
  it('따옴표 안의 콤마를 보존한다', () => {
    expect(splitCSVLine('"서울특별시  (1100000000)","9,218,911","4,476,667"'))
      .toEqual(['서울특별시  (1100000000)', '9,218,911', '4,476,667'])
  })

  it('빈 셀을 유지한다 — 개편월의 빈칸이 사라지면 컬럼이 밀린다', () => {
    expect(splitCSVLine('"a",,"c"')).toEqual(['a', '', 'c'])
  })
})

describe('숫자 파싱', () => {
  it('콤마를 제거한다', () => {
    expect(parseNum('9,218,911')).toBe(9218911)
  })

  it('빈칸과 비숫자는 null 이다 — 0 으로 읽으면 결측과 실제 0 을 구분할 수 없다', () => {
    expect(parseNum('')).toBeNull()
    expect(parseNum('-')).toBeNull()
    expect(parseNum(undefined)).toBeNull()
  })

  it('세대당 인구의 공백 패딩을 처리한다', () => {
    expect(parseFloatCell('          2.06')).toBe(2.06)
  })
})

describe('행정구역 셀', () => {
  it('이름과 코드를 분리한다', () => {
    expect(parseRegionCell('서울특별시 종로구 (1111000000)'))
      .toEqual({ code: '1111000000', name: '서울특별시 종로구' })
  })

  it('이름 뒤 이중 공백을 정리한다 (시도 행)', () => {
    expect(parseRegionCell('서울특별시  (1100000000)')?.name).toBe('서울특별시')
  })

  it('코드가 없으면 null 이다', () => {
    expect(parseRegionCell('행정구역')).toBeNull()
    expect(parseRegionCell('서울특별시 (110000)')).toBeNull()
  })

  it('자모 분리(NFD) 입력을 NFC 로 정규화한다', () => {
    const nfd = '서울특별시 종로구 (1111000000)'.normalize('NFD')
    expect(parseRegionCell(nfd)?.name).toBe('서울특별시 종로구')
  })
})

describe('헤더', () => {
  const header = ['행정구역', '2026년07월_거주자 인구수', '2026년07월_세대수', '2026년08월_세대수']

  it('월과 항목을 분해하고 행정구역 컬럼은 건너뛴다', () => {
    const cols = parseHeader(header)
    expect(cols).toHaveLength(3)
    expect(cols[0]).toEqual({ ym: '202607', field: '거주자 인구수', index: 1 })
  })

  it('연월을 오름차순으로 모은다', () => {
    expect(monthsOf(parseHeader(header))).toEqual(['202607', '202608'])
  })
})

// ── 인구·세대 ────────────────────────────────────────────────────────────────

const POP_CSV = [
  '"행정구역","2026년06월_거주자 인구수","2026년06월_세대수","2026년06월_세대당 인구","2026년06월_남자 인구수","2026년06월_여자 인구수","2026년06월_남여 비율","2026년07월_거주자 인구수","2026년07월_세대수","2026년07월_세대당 인구","2026년07월_남자 인구수","2026년07월_여자 인구수","2026년07월_남여 비율"',
  '"서울특별시  (1100000000)","9,233,000","4,470,000","          2.07","4,440,000","4,793,000","          0.93","9,218,911","4,476,667","          2.06","4,435,257","4,783,654","          0.93"',
  '"서울특별시 종로구 (1111000000)","134,000","71,000","          1.89","64,000","70,000","          0.91","134,509","71,281","          1.89","64,360","70,149","          0.92"',
  '"강원도 춘천시 (4211000000)","285,773","130,000","          2.20","142,000","143,773","          0.99","","","","","",""',
  '"강원특별자치도 춘천시 (5111000000)","","","","","","","285,858","130,100","          2.20","142,100","143,758","          0.99"',
].join('\n')

describe('인구·세대 CSV', () => {
  const { rows, months, unknownFields } = parsePopulationCSV(POP_CSV)
  const byCode = new Map(rows.map(r => [r.code, r]))

  it('월 목록을 뽑는다', () => {
    expect(months).toEqual(['202606', '202607'])
  })

  it('쓰지 않는 컬럼(남여 비율)을 미지 필드로 신고하지 않는다', () => {
    expect(unknownFields).toEqual([])
  })

  it('지표를 이름으로 찾는다 — 위치가 아니라', () => {
    const jongno = byCode.get('1111000000')!.months.get('202607')!
    expect(jongno).toEqual({
      population: 134509, households: 71281, householdSize: 1.89, male: 64360, female: 70149,
    })
  })

  it('개편월의 빈칸은 건너뛴다 — 구·신 코드가 서로 다른 달을 채운다', () => {
    // 구 코드는 06월만, 신 코드는 07월만 갖는다. 빈칸을 0 으로 읽으면 이 구조가 무너진다.
    expect([...byCode.get('4211000000')!.months.keys()]).toEqual(['202606'])
    expect([...byCode.get('5111000000')!.months.keys()]).toEqual(['202607'])
  })

  it('시도 합계 행도 그대로 돌려준다 — 검증 기준값으로 쓰인다', () => {
    expect(byCode.get('1100000000')!.months.get('202607')!.population).toBe(9218911)
  })

  it('컬럼 순서가 바뀌어도 같은 값을 읽는다', () => {
    const shuffled = [
      '"행정구역","2026년07월_세대수","2026년07월_거주자 인구수"',
      '"서울특별시 종로구 (1111000000)","71,281","134,509"',
    ].join('\n')
    const stats = parsePopulationCSV(shuffled).rows[0].months.get('202607')!
    expect(stats.population).toBe(134509)
    expect(stats.households).toBe(71281)
  })
})

// ── 연령별 ───────────────────────────────────────────────────────────────────

/** 계/남/여 각각 총인구수·연령구간인구수 + 11구간 = 39컬럼 */
function ageCSV(buckets: string[], values: number[]) {
  const genders = ['거주자', '남_거주자', '여_거주자']
  const head = ['"행정구역"']
  const row = ['"서울특별시 종로구 (1111000000)"']
  for (const g of genders) {
    head.push(`"2026년07월_${g}_총인구수"`, `"2026년07월_${g}_연령구간인구수"`)
    row.push('"0"', '"0"')
    for (const b of buckets) {
      head.push(`"2026년07월_${g}_${b}"`)
      row.push(`"${values[buckets.indexOf(b)]}"`)
    }
  }
  return head.join(',') + '\n' + row.join(',')
}

const FULL_BUCKETS = ['0~9세', '10~19세', '20~29세', '30~39세', '40~49세', '50~59세', '60~69세', '70~79세', '80~89세', '90~99세', '100세 이상']

describe('연령 구간', () => {
  it('구간 하한을 읽는다 — 상한이 아니라', () => {
    expect(ageLowerBound('0~9세')).toBe(0)
    expect(ageLowerBound('80~89세')).toBe(80)
    expect(ageLowerBound('100세 이상')).toBe(100)
  })

  it('80 이상은 모두 마지막 버킷으로 접는다', () => {
    expect(bucketIndexOf(0)).toBe(0)
    expect(bucketIndexOf(70)).toBe(7)
    expect(bucketIndexOf(80)).toBe(8)
    expect(bucketIndexOf(90)).toBe(8)
    expect(bucketIndexOf(100)).toBe(8)
  })

  it('성별 접두사와 집계 컬럼을 구분한다', () => {
    expect(parseAgeField('남_거주자_0~9세')).toEqual({ gender: 'male', lowerBound: 0 })
    expect(parseAgeField('여_거주자_100세 이상')).toEqual({ gender: 'female', lowerBound: 100 })
    expect(parseAgeField('거주자_30~39세')).toEqual({ gender: 'total', lowerBound: 30 })
    expect(parseAgeField('거주자_총인구수')).toBeNull()
    expect(parseAgeField('남_거주자_연령구간인구수')).toBeNull()
  })
})

describe('연령별 CSV', () => {
  it('11구간을 9버킷으로 재집계한다 (80+ = 80~89 + 90~99 + 100+)', () => {
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 5, 1]
    const { rows, incompleteMonths } = parseAgeCSV(ageCSV(FULL_BUCKETS, values))
    const groups = rows[0].months.get('202607')!

    expect(groups.map(g => g.label)).toEqual([...AGE_BUCKETS])
    expect(groups[0]).toEqual({ label: '0–9', male: 10, female: 10 })
    expect(groups[8]).toEqual({ label: '80+', male: 96, female: 96 }) // 90 + 5 + 1
    expect(incompleteMonths).toEqual([])
  })

  it('구간이 빠진 달을 잡아낸다 — 2026-08 에 0~9세만 담긴 파일이 들어온 적이 있다', () => {
    const { incompleteMonths } = parseAgeCSV(ageCSV(['0~9세'], [10]))
    expect(incompleteMonths).toEqual(['202607'])
  })

  it('5세 단위 원본도 같은 9버킷으로 접는다', () => {
    const five = ['0~4세', '5~9세', '10~14세', '15~19세', '20~24세', '25~29세', '30~34세', '35~39세',
      '40~44세', '45~49세', '50~54세', '55~59세', '60~64세', '65~69세', '70~74세', '75~79세',
      '80~84세', '85~89세', '90~94세', '95~99세', '100세 이상']
    const { rows, incompleteMonths } = parseAgeCSV(ageCSV(five, five.map(() => 1)))
    const groups = rows[0].months.get('202607')!
    expect(incompleteMonths).toEqual([])
    expect(groups[0]).toEqual({ label: '0–9', male: 2, female: 2 })   // 0~4 + 5~9
    expect(groups[8]).toEqual({ label: '80+', male: 5, female: 5 })   // 80~84 … 100+
  })

  it('전 구간이 0 인 달은 데이터 없음으로 본다', () => {
    const { rows } = parseAgeCSV(ageCSV(FULL_BUCKETS, FULL_BUCKETS.map(() => 0)))
    expect(rows[0].months.size).toBe(0)
  })
})

// ── 파일 분류·코드 ───────────────────────────────────────────────────────────

describe('파일 분류', () => {
  it('한글 파일명으로 종류를 판별한다', () => {
    expect(classifyRawFile('202607_202607_연령별인구현황_월간.csv')).toBe('age')
    expect(classifyRawFile('202601_202606_주민등록인구및세대현황_월간.csv')).toBe('population')
    expect(classifyRawFile('README.md')).toBeNull()
  })

  it('macOS 가 저장하는 NFD 파일명도 인식한다', () => {
    // 정규화를 빠뜨리면 항상 null 이 되어 파일을 통째로 놓친다 (2026-08 실제 함정)
    expect(classifyRawFile('202607_202607_연령별인구현황_월간.csv'.normalize('NFD'))).toBe('age')
  })
})

describe('행정 코드 판별', () => {
  it('시도 행과 시군구 행을 구분한다', () => {
    expect(isSidoRow('1100000000')).toBe(true)
    expect(isSigunguRow('1100000000')).toBe(false)
    expect(isSigunguRow('1111000000')).toBe(true)
  })

  it('읍면동을 배제한다 — 상위 단위와 이중 계상된다', () => {
    expect(isSigunguRow('1111051000')).toBe(false)
  })
})

describe('인코딩', () => {
  it('UTF-8 BOM 을 제거한다', () => {
    const buf = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode('행정구역')])
    expect(decodeCSV(buf)).toBe('행정구역')
  })

  it('BOM 없는 UTF-8 을 그대로 읽는다', () => {
    expect(decodeCSV(new TextEncoder().encode('행정구역,인구'))).toBe('행정구역,인구')
  })

  it('CP949 를 판별해 디코딩한다', () => {
    // '행정구역' EUC-KR 바이트열
    const cp949 = new Uint8Array([0xc7, 0xe0, 0xc1, 0xa4, 0xb1, 0xb8, 0xbf, 0xaa])
    expect(decodeCSV(cp949)).toBe('행정구역')
  })
})
