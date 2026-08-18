/**
 * 월간 인구 리포트 생성기 (docs/backlog.md N-5)
 *
 * 매월 데이터가 들어오면 `/report/YYYY-MM` 한 장이 자동으로 늘어난다.
 * 데이터 갱신이 곧 콘텐츠 생산이 되는 구조가 목적이다.
 *
 * 모든 문장은 그 달의 실제 수치에서 파생된다 (docs/principles.md B2).
 * 집계 대상은 현행 최상위 시군구뿐이다 — getAllRegionRankings 가 그 규칙을 이미 지킨다.
 */
import type { Region } from './types'
import {
  getAvailableMonths,
  getAllRegionRankings,
  getAllRegions,
  getMonthStats,
} from './data'

export interface ReportRegion {
  region: Region
  population: number
  /** 전월 대비 증감(명) */
  change: number
  /** 전월 대비 증감률(%) */
  rate: number
}

export interface ReportSido {
  sido: string
  population: number
  change: number
  rate: number
  /** 이 시도에서 인구가 늘어난 시군구 수 */
  gainerCount: number
  regionCount: number
}

export interface ReportReorg {
  /** 이 달에 통계가 시작된 지역 */
  created: Region[]
  /** 직전 달을 끝으로 통계가 끝난 지역 */
  retired: Region[]
}

export interface MonthlyReport {
  ym: string
  /** '2026-07' — URL 세그먼트 */
  slug: string
  /** '2026년 7월' */
  label: string
  prevYm: string
  prevLabel: string
  national: {
    /** 그 달의 전국 합계. 홈·순위와 같은 값이어야 한다 (principles.md B1) */
    population: number
    /** 전월 전국 합계 대비 증감 */
    change: number
    rate: number
    /** 그 달 집계에 든 시군구 수 */
    regionCount: number
    /** 전월과 비교 가능한(양쪽 달에 데이터가 있는) 시군구 수 */
    comparableCount: number
    gainerCount: number
    loserCount: number
  }
  /** 증감 인원 상위/하위 */
  gainers: ReportRegion[]
  losers: ReportRegion[]
  /** 증감률 상위/하위 */
  fastestGrowth: ReportRegion[]
  fastestDecline: ReportRegion[]
  sidos: ReportSido[]
  reorg: ReportReorg
  headline: string
  paragraphs: string[]
}

const TOP_N = 5

export function ymToSlug(ym: string): string {
  return `${ym.slice(0, 4)}-${ym.slice(4)}`
}

export function slugToYm(slug: string): string | null {
  const m = slug.match(/^(\d{4})-(\d{2})$/)
  return m ? `${m[1]}${m[2]}` : null
}

export function formatYmLabel(ym: string): string {
  return `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4), 10)}월`
}

/**
 * 리포트를 만들 수 있는 월 목록.
 * 전월 대비가 리포트의 뼈대라 첫 달은 제외한다.
 */
export function getReportMonths(): string[] {
  return getAvailableMonths().slice(1)
}

/** 그 달의 전국 합계. getNationalSummary 와 같은 규칙(현행 최상위 시군구 합)이다. */
function sumAt(ym: string): number {
  return getAllRegionRankings(ym).reduce((s, e) => s + e.population, 0)
}

/** 이 달에 시작되거나 끝난 지역. 행정구역 개편이 있었던 달에만 값이 있다. */
function findReorg(ym: string, prevYm: string): ReportReorg {
  const created: Region[] = []
  const retired: Region[] = []
  for (const r of getAllRegions()) {
    const cur = getMonthStats(r.code, ym)
    const prev = getMonthStats(r.code, prevYm)
    if (cur && !prev) created.push(r)
    if (!cur && prev) retired.push(r)
  }
  return { created, retired }
}

export function buildMonthlyReport(ym: string): MonthlyReport | null {
  const months = getAvailableMonths()
  const idx = months.indexOf(ym)
  if (idx < 1) return null
  const prevYm = months[idx - 1]

  const entries = getAllRegionRankings(ym)
  if (entries.length === 0) return null

  // 전월 데이터가 있는 지역만 증감을 말할 수 있다.
  // 신설 지역은 비교 대상이 없으므로 순위에서 빼고 개편 항목에서 따로 다룬다.
  const rows: ReportRegion[] = []
  for (const e of entries) {
    const prev = getMonthStats(e.region.code, prevYm)
    if (!prev || prev.population === 0) continue
    rows.push({
      region: e.region,
      population: e.population,
      change: e.population - prev.population,
      rate: ((e.population - prev.population) / prev.population) * 100,
    })
  }
  if (rows.length === 0) return null

  const byChange = [...rows].sort((a, b) => b.change - a.change)
  const byRate = [...rows].sort((a, b) => b.rate - a.rate)

  // 전국 합계는 **그 달에 데이터가 있는 지역 전부**로 낸다.
  // rows(전월 비교 가능한 지역)로 내면 신설 지역이 빠져 홈·순위와 숫자가 어긋난다.
  // 2026.07 인천 개편에서 실제로 90만 명 차이가 났다 (principles.md B1).
  const population = entries.reduce((s, e) => s + e.population, 0)
  const prevPopulation = sumAt(prevYm)
  const change = population - prevPopulation
  const gainerCount = rows.filter(r => r.change > 0).length
  const loserCount = rows.filter(r => r.change < 0).length

  // 시도별 집계
  const sidoMap = new Map<string, ReportSido>()
  for (const r of rows) {
    const cur = sidoMap.get(r.region.sido) ?? {
      sido: r.region.sido, population: 0, change: 0, rate: 0, gainerCount: 0, regionCount: 0,
    }
    cur.population += r.population
    cur.change += r.change
    cur.regionCount += 1
    if (r.change > 0) cur.gainerCount += 1
    sidoMap.set(r.region.sido, cur)
  }
  const sidos = [...sidoMap.values()]
    .map(s => ({ ...s, rate: s.population - s.change > 0 ? (s.change / (s.population - s.change)) * 100 : 0 }))
    .sort((a, b) => b.change - a.change)

  const reorg = findReorg(ym, prevYm)

  const report: MonthlyReport = {
    ym,
    slug: ymToSlug(ym),
    label: formatYmLabel(ym),
    prevYm,
    prevLabel: formatYmLabel(prevYm),
    national: {
      population,
      change,
      rate: prevPopulation > 0 ? (change / prevPopulation) * 100 : 0,
      regionCount: entries.length,
      comparableCount: rows.length,
      gainerCount,
      loserCount,
    },
    gainers: byChange.slice(0, TOP_N),
    losers: byChange.slice(-TOP_N).reverse(),
    fastestGrowth: byRate.slice(0, TOP_N),
    fastestDecline: byRate.slice(-TOP_N).reverse(),
    sidos,
    reorg,
    headline: '',
    paragraphs: [],
  }

  report.headline = buildHeadline(report)
  report.paragraphs = buildParagraphs(report)
  return report
}

// ── 서술 ─────────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('ko-KR')
const signed = (n: number) => (n >= 0 ? '+' : '') + fmt(n)
/** 부호 없는 절댓값. "3,716명 줄었습니다"처럼 방향을 서술로 말할 때 쓴다. */
const abs = (n: number) => fmt(Math.abs(n))
const name = (r: ReportRegion) => `${r.region.sido} ${r.region.sigungu}`

/** 받침 유무. 한글이 아니면 받침 없음으로 본다. */
function hasJong(word: string): boolean {
  const c = word.trim().charCodeAt(word.trim().length - 1)
  if (Number.isNaN(c) || c < 0xac00 || c > 0xd7a3) return false
  return (c - 0xac00) % 28 !== 0
}

/** 받침에 맞는 조사를 붙인다. '의왕시으로' 같은 표기를 막는다. */
function josa(word: string, type: '은는' | '이가' | '으로' | '을를'): string {
  const jong = hasJong(word)
  const last = word.trim().charCodeAt(word.trim().length - 1)
  const isRieul = jong && (last - 0xac00) % 28 === 8
  switch (type) {
    case '은는': return word + (jong ? '은' : '는')
    case '이가': return word + (jong ? '이' : '가')
    case '을를': return word + (jong ? '을' : '를')
    // 받침이 없거나 'ㄹ' 받침이면 '로'
    case '으로': return word + (!jong || isRieul ? '로' : '으로')
  }
}

/**
 * 헤드라인 분기 임계값.
 *
 * 실측(2023.02~2026.07, 42개월)에서 뽑았다 — 감으로 정하면 한 버킷에 몰린다
 * (docs/principles.md B2).
 *   전국 증감      -22,802 ~ -1,423명 (중앙 -7,236) · **증가한 달 0개**
 *   증가 시군구 비율 21.0 ~ 43.2% (사분위 24.5 / 28.4 / 31.4)
 *
 * 전국 인구는 이 기간 내내 줄었다. 그래서 "늘었나 줄었나"로는 갈리지 않고,
 * **얼마나 줄었나 + 감소가 얼마나 퍼져 있나** 두 축으로 나눈다.
 * 증가 분기는 지금 데이터에서는 쓰이지 않지만 앞으로를 위해 남겨둔다.
 */
const LARGE_DROP = 12_000
const SMALL_DROP = 5_000
const WIDE_GAIN_SHARE = 31.4
const NARROW_GAIN_SHARE = 24.5

function buildHeadline(r: MonthlyReport): string {
  const { change, gainerCount, loserCount, comparableCount } = r.national
  const share = (gainerCount / comparableCount) * 100

  if (change > 0) {
    return share >= 50
      ? `전국 인구가 ${abs(change)}명 늘었고, 비교 가능한 시군구 ${comparableCount}곳 중 ${gainerCount}곳이 증가했습니다.`
      : `전국 인구는 ${abs(change)}명 늘었지만 증가한 시군구는 ${gainerCount}곳뿐입니다. 일부 지역에 쏠린 증가입니다.`
  }
  if (change === 0) {
    return `전국 인구가 ${r.prevLabel}과 같았습니다. 시군구 ${comparableCount}곳 중 ${gainerCount}곳은 늘고 ${loserCount}곳은 줄었습니다.`
  }

  const size = Math.abs(change)
  const magnitude = size >= LARGE_DROP ? '큰 폭으로 ' : size >= SMALL_DROP ? '' : '소폭 '
  const spread =
    share >= WIDE_GAIN_SHARE
      ? `그래도 ${gainerCount}곳은 늘어 감소가 전국에 고르게 나타나지는 않았습니다.`
      : share >= NARROW_GAIN_SHARE
        ? `늘어난 곳은 ${gainerCount}곳입니다.`
        : `비교 가능한 ${comparableCount}곳 중 ${loserCount}곳이 줄어 감소가 폭넓게 나타났습니다.`

  return `전국 인구가 ${abs(change)}명 ${magnitude}줄었습니다. ${spread}`
}

function buildParagraphs(r: MonthlyReport): string[] {
  const p: string[] = []
  const top = r.gainers[0]
  const bottom = r.losers[0]

  const dir = (n: number) => (n > 0 ? '늘었' : n < 0 ? '줄었' : '변동이 없었')

  // 1) 전국 흐름
  p.push(
    `${r.label} 기준 전국 주민등록 인구는 ${fmt(r.national.population)}명으로 ` +
    `${r.prevLabel}보다 ${abs(r.national.change)}명(${Math.abs(r.national.rate).toFixed(3)}%) ` +
    `${dir(r.national.change)}습니다. 전월과 비교할 수 있는 시군구 ${r.national.comparableCount}곳 가운데 ` +
    `${r.national.gainerCount}곳이 늘고 ${r.national.loserCount}곳이 줄었습니다.`,
  )

  // 2) 증가·감소 최대 지역
  if (top && bottom) {
    p.push(
      `한 달 사이 인구가 가장 많이 늘어난 곳은 ${josa(name(top), '으로')} ` +
      `${abs(top.change)}명(${top.rate >= 0 ? '+' : ''}${top.rate.toFixed(2)}%), ` +
      `가장 많이 줄어든 곳은 ${josa(name(bottom), '으로')} ` +
      `${abs(bottom.change)}명(${bottom.rate >= 0 ? '+' : ''}${bottom.rate.toFixed(2)}%)입니다.`,
    )
  }

  // 3) 인원 vs 비율의 차이 — 규모가 작은 지역은 비율이 크게 흔들린다
  const fast = r.fastestGrowth[0]
  if (fast && top && fast.region.code !== top.region.code && fast.change > 0) {
    p.push(
      `증가율로 보면 순서가 달라집니다. ${josa(name(fast), '이가')} ${fast.rate.toFixed(2)}%로 가장 높았지만 ` +
      `실제 증가는 ${abs(fast.change)}명입니다. 인구 ${fmt(fast.population)}명 규모라 ` +
      `적은 변동도 비율로는 크게 보입니다. 후보지를 좁힐 때는 증가율과 증가 인원을 함께 봐야 합니다.`,
    )
  }

  // 4) 시도 분포
  const up = r.sidos.filter(s => s.change > 0)
  const down = r.sidos.filter(s => s.change < 0)
  if (up.length > 0 || down.length > 0) {
    const lead = r.sidos[0]
    const last = r.sidos[r.sidos.length - 1]
    p.push(
      `시도 단위로는 ${r.sidos.length}곳 중 ${up.length}곳이 늘고 ${down.length}곳이 줄었습니다. ` +
      `증가폭이 가장 큰 곳은 ${lead.sido}(${signed(lead.change)}명), 감소폭이 가장 큰 곳은 ` +
      `${last.sido}(${signed(last.change)}명)입니다.` +
      (lead.regionCount > 1
        ? ` ${lead.sido} 안에서도 ${lead.regionCount}곳 중 ${lead.gainerCount}곳만 늘었습니다 — 시도 수치는 평균일 뿐이라 시군구별로 갈립니다.`
        : ''),
    )
  }

  // 5) 행정구역 개편 — 있는 달에만
  if (r.reorg.created.length > 0 || r.reorg.retired.length > 0) {
    const parts: string[] = []
    if (r.reorg.retired.length > 0) {
      parts.push(`${r.reorg.retired.map(x => `${x.sido} ${x.sigungu}`).join(', ')}의 통계가 ${r.prevLabel}을 끝으로 종료되었습니다`)
    }
    if (r.reorg.created.length > 0) {
      const names = r.reorg.created.map(x => `${x.sido} ${x.sigungu}`).join(', ')
      parts.push(`${josa(names, '이가')} 새로 집계에 들어왔습니다`)
    }
    p.push(
      `이 달에는 행정구역 개편이 있었습니다. ${parts.join('. ')}. ` +
      `개편으로 나뉜 지역은 과거 인구를 새 지역에 나눠 붙일 근거가 없어 시계열을 잇지 않습니다. ` +
      `신설 지역은 통계가 쌓이기 전까지 전년 대비 비교가 불가능합니다.`,
    )
  }

  return p
}
