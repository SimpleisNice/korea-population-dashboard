/**
 * level 은 행정 계층을 구분한다.
 *  - 'sigungu'  : 최상위 시군구 (자치구·시·군). 전국·시도 합계와 순위의 기준 집합
 *  - 'district' : 일반구 (예: 수원시 장안구). 부모 시에 이미 포함되므로 합계·순위에서 제외
 * 계층을 섞어 집계하면 인구가 이중 계상된다 — docs/principles.md A1 참고.
 */
export type RegionLevel = 'sigungu' | 'district'

export interface Region {
  code: string
  sido: string
  sigungu: string
  level: RegionLevel
  /**
   * 행정구역 분할 개편으로 폐지된 지역의 마지막 데이터 월('YYYYMM').
   * 현행 지역에는 없다. 이력 조회는 되지만 최신월 데이터가 없어
   * 순위·전국 합계에서는 무폴백 규칙에 의해 자동 제외된다(principles.md A4-1).
   */
  retiredAfter?: string
  /** 폐지 지역을 승계한 현행 지역 코드들. 지역 페이지에서 안내 링크로 쓴다. */
  successorCodes?: string[]
}

export interface MonthlyStats {
  population: number
  households: number
  householdSize: number
  male: number
  female: number
}

export interface TrendPoint {
  label: string
  population: number
  households: number
  change: number
  householdsChange: number
}

export interface AgeGroup {
  label: string
  male: number
  female: number
}

export interface RegionDetail {
  region: Region
  latest: MonthlyStats
  prevMonth: MonthlyStats | null
  yoyMonth: MonthlyStats | null
  trend: TrendPoint[]
  ageGroups: AgeGroup[]
}

export interface RegionRank {
  nationalRank: number
  nationalTotal: number
  sidoRank: number
  sidoTotal: number
}

export interface NationalSummary {
  totalPopulation: number
  prevMonthChange: number
  month: string
}

export interface RegionRankEntry {
  region: Region
  population: number
  households: number
  householdSize: number
  popChange: number
  popChangeYoy: number
  popChangeRate: number
  /**
   * 세대 분화 — 세대수 증가율 − 인구 증가율 (전년 동월 대비, %포인트).
   * 양수면 한 가구에 사는 사람 수가 줄고 있다는 뜻이다.
   * 전년 동월 데이터가 없으면 null.
   */
  householdDivergence: number | null
  rank: RegionRank
}

export interface TrendEntry {
  region: Region
  startPop: number
  endPop: number
  change: number
  changeRate: number
}

export interface CompareData {
  a: RegionDetail
  b: RegionDetail
}
