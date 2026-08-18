/**
 * 지역 서술 생성기
 *
 * 각 시군구의 실제 수치에서 판정과 분석 문단을 만든다.
 * 값에 따라 분기하므로 지역마다 내용이 달라진다 — 고정 템플릿 문구를 쓰지 않는다
 * (docs/principles.md B2).
 *
 * 판정(verdict)은 지표를 나열하는 대신 "그래서 어떤 지역인가"에 한 문장으로 답한다
 * (docs/principles.md 0-1, 백로그 N-6).
 *
 * 연령 지표는 10세 단위 버킷 기반이라 통계청 공식 정의(노령화지수 65+/0~14,
 * 생산연령 15~64)와 경계가 다르다. 그래서 공식 지표명을 쓰지 않고
 * "60세 이상 비중", "20~50대 비중" 처럼 계산 그대로 부른다 (docs/principles.md A2).
 */
import type { AgeGroup, MonthlyStats, RegionRank, TrendPoint } from './types'

export interface NarrativeInput {
  sigunguName: string
  sidoName: string
  ym: string
  latest: MonthlyStats
  yoyMonth: MonthlyStats | null
  trend: TrendPoint[]
  ageGroups: AgeGroup[]
  rank: RegionRank | null
}

export type VerdictTone = 'positive' | 'neutral' | 'negative'

export interface RegionNarrative {
  /** 페이지 최상단 한 줄 판정 */
  verdict: { headline: string; detail: string; tone: VerdictTone } | null
  /** 본문 분석 문단 */
  paragraphs: string[]
}

// ── 파생 지표 ─────────────────────────────────────────────────────────────────

const ELDERLY = ['60–69', '70–79', '80+']
const PRIME = ['20–29', '30–39', '40–49', '50–59']
const YOUTH = ['0–9', '10–19']

function sumOf(groups: AgeGroup[], labels: string[]): number {
  return groups
    .filter(g => labels.includes(g.label))
    .reduce((s, g) => s + g.male + g.female, 0)
}

interface Derived {
  yoyRate: number | null
  elderlyShare: number | null
  primeShare: number | null
  youthShare: number | null
  topAgeLabel: string | null
  /** 세대 증가율 − 인구 증가율. 양수면 가구 분화(1~2인 가구 전환)가 진행 중 */
  householdDivergence: number | null
  periodMonths: number
}

function derive(input: NarrativeInput): Derived {
  const { latest, yoyMonth, trend, ageGroups } = input

  const yoyRate = yoyMonth && yoyMonth.population > 0
    ? ((latest.population - yoyMonth.population) / yoyMonth.population) * 100
    : null

  const total = ageGroups.reduce((s, g) => s + g.male + g.female, 0)
  const share = (labels: string[]) => (total > 0 ? (sumOf(ageGroups, labels) / total) * 100 : null)

  const topAge = ageGroups.length
    ? ageGroups.reduce((a, b) => (a.male + a.female >= b.male + b.female ? a : b))
    : null

  let householdDivergence: number | null = null
  if (trend.length >= 2) {
    const first = trend[0]
    const last = trend[trend.length - 1]
    if (first.population > 0 && first.households > 0) {
      const popRate = ((last.population - first.population) / first.population) * 100
      const hhRate = ((last.households - first.households) / first.households) * 100
      householdDivergence = hhRate - popRate
    }
  }

  return {
    yoyRate,
    elderlyShare: share(ELDERLY),
    primeShare: share(PRIME),
    youthShare: share(YOUTH),
    topAgeLabel: topAge?.label ?? null,
    householdDivergence,
    periodMonths: trend.length,
  }
}

// ── 한 줄 판정 ────────────────────────────────────────────────────────────────

function buildVerdict(input: NarrativeInput, d: Derived): RegionNarrative['verdict'] {
  const { yoyRate, elderlyShare, primeShare, householdDivergence } = d
  if (yoyRate === null) return null

  const growing = yoyRate >= 0.5
  const shrinking = yoyRate <= -0.5
  const aged = elderlyShare !== null && elderlyShare >= 30
  const primeHeavy = primeShare !== null && primeShare >= 55
  const splitting = householdDivergence !== null && householdDivergence >= 2

  const rate = `${yoyRate >= 0 ? '+' : ''}${yoyRate.toFixed(2)}%`

  if (growing && primeHeavy) {
    return {
      tone: 'positive',
      headline: '인구가 늘고 있고, 20~50대 비중도 두껍습니다',
      detail: `최근 1년 ${rate}. 실수요가 뒷받침되는 구간으로, 주거 수요와 배후 상권이 함께 커질 여지가 있습니다.`,
    }
  }
  if (growing && aged) {
    return {
      tone: 'neutral',
      headline: '인구는 늘지만 고령층 비중이 높습니다',
      detail: `최근 1년 ${rate}. 유입이 있어도 연령대가 높으면 필요한 주거 형태와 업종이 달라집니다. 어느 연령이 늘었는지 확인이 필요합니다.`,
    }
  }
  if (growing) {
    return {
      tone: 'positive',
      headline: '인구가 늘고 있습니다',
      detail: `최근 1년 ${rate}. 신규 입주나 일자리 유입이 진행 중일 가능성이 있어, 추세가 이어지는지 살펴볼 구간입니다.`,
    }
  }
  if (shrinking && splitting) {
    return {
      tone: 'neutral',
      headline: '인구는 줄지만 세대수는 늘고 있습니다',
      detail: `최근 1년 ${rate}. 가구 분화가 진행 중이라 총인구 감소에도 소형 주거 수요는 유지되거나 늘 수 있습니다.`,
    }
  }
  if (shrinking && aged) {
    return {
      tone: 'negative',
      headline: '인구가 줄고 고령화도 진행 중입니다',
      detail: `최근 1년 ${rate}. 수요 위축과 공실 위험을 함께 고려해야 하는 구간입니다.`,
    }
  }
  if (shrinking) {
    return {
      tone: 'negative',
      headline: '인구가 줄고 있습니다',
      detail: `최근 1년 ${rate}. 감소가 일시적인지 구조적인지 기간을 넓혀 확인할 필요가 있습니다.`,
    }
  }
  return {
    tone: 'neutral',
    headline: '인구가 거의 변하지 않았습니다',
    detail: `최근 1년 ${rate}. 총인구보다 연령 구조와 세대수 변화에서 실수요 신호를 읽는 편이 낫습니다.`,
  }
}

// ── 분석 문단 ─────────────────────────────────────────────────────────────────

function scaleLabel(pop: number): string {
  if (pop >= 500_000) return '대도시급'
  if (pop >= 200_000) return '중견 도시'
  if (pop >= 100_000) return '중소 도시'
  if (pop >= 50_000) return '소규모 도시'
  return '인구 소멸 대응이 필요한 소규모 지역'
}

function ageBandLabel(label: string): string {
  return label === '80+' ? '80대 이상' : `${label.split('–')[0]}대`
}

export function buildRegionNarrative(input: NarrativeInput): RegionNarrative {
  const { sigunguName, sidoName, ym, latest, rank } = input
  const d = derive(input)
  const monthLabel = `${ym.slice(0, 4)}년 ${parseInt(ym.slice(4))}월`
  const paragraphs: string[] = []

  // 1) 규모와 순위
  const rankText = rank
    ? ` ${sidoName} 내 ${rank.sidoRank}위, 전국 ${rank.nationalTotal}개 시군구 중 ${rank.nationalRank}위 규모입니다.`
    : '.'
  paragraphs.push(
    `${sigunguName}은(는) ${monthLabel} 기준 주민등록 인구 ${latest.population.toLocaleString('ko-KR')}명으로 ` +
    `${scaleLabel(latest.population)}에 해당하며,${rankText}`,
  )

  // 2) 1년간 추세
  if (d.yoyRate !== null) {
    const abs = Math.abs(d.yoyRate).toFixed(2)
    if (d.yoyRate >= 1) {
      paragraphs.push(
        `최근 1년간 인구가 ${abs}% 늘며 뚜렷한 성장세를 보였습니다. ` +
        `신규 주택 공급이나 일자리 유입이 뒷받침될 경우 주거 수요와 상권 확대가 이어질 가능성이 높은 구간입니다.`,
      )
    } else if (d.yoyRate > 0) {
      paragraphs.push(
        `최근 1년간 인구가 ${abs}% 소폭 증가하며 안정적인 흐름을 유지하고 있습니다. ` +
        `급격한 변동보다는 완만한 수요가 예상되는 지역입니다.`,
      )
    } else if (d.yoyRate > -1) {
      paragraphs.push(
        `최근 1년간 인구가 ${abs}% 소폭 감소해 정체 국면에 있습니다. ` +
        `세대수·연령 구조 변화를 함께 살펴 실수요 흐름을 확인할 필요가 있습니다.`,
      )
    } else {
      paragraphs.push(
        `최근 1년간 인구가 ${abs}% 줄며 감소세가 이어졌습니다. ` +
        `부동산 수요 위축과 공실 리스크 가능성을 함께 고려해야 하는 구간입니다.`,
      )
    }
  } else {
    // 행정구역 개편으로 신설된 지역은 비교할 과거가 없다.
    // 없는 추세를 만들어내지 않고 왜 없는지 밝힌다 (docs/principles.md A3).
    const n = input.trend.length
    paragraphs.push(
      n <= 1
        ? `${monthLabel}이 이 지역의 첫 통계 시점이라 아직 인구 추세를 판단할 수 없습니다. ` +
          `행정구역 개편으로 신설된 지역은 12개월치가 쌓인 뒤에야 전년 대비 비교가 가능합니다.`
        : `누적 통계가 ${n}개월치뿐이라 전년 동월 대비 증감률을 아직 산출할 수 없습니다. ` +
          `당분간은 월별 증감으로 흐름을 확인해야 하는 지역입니다.`,
    )
  }

  // 3) 연령 구조 — 부동산·상권 함의까지
  if (d.elderlyShare !== null && d.primeShare !== null && d.youthShare !== null && d.topAgeLabel) {
    const elderly = d.elderlyShare.toFixed(1)
    const prime = d.primeShare.toFixed(1)
    const youth = d.youthShare.toFixed(1)
    const band = ageBandLabel(d.topAgeLabel)

    let reading: string
    if (d.elderlyShare >= 35) {
      reading =
        '고령층 비중이 전국에서도 높은 편에 속합니다. 의료·생활 편의 접근성이 주거 선택을 좌우하고, ' +
        '상권도 생활 밀착 업종 중심으로 형성되는 경향이 있습니다.'
    } else if (d.elderlyShare >= 25) {
      reading =
        '고령화가 완만히 진행 중인 구조입니다. 당장의 수요보다 10년 뒤 인구 구성이 어떻게 바뀔지를 함께 보는 것이 좋습니다.'
    } else if (d.youthShare >= 18) {
      reading =
        '유소년 비중이 높아 학령 인구 기반이 두터운 편입니다. 학군과 가족 단위 주거 수요가 상대적으로 강하게 나타납니다.'
    } else {
      reading =
        '생산연령대 중심의 구조로, 직주근접 수요와 소비 활동이 상대적으로 활발한 편입니다.'
    }

    paragraphs.push(
      `연령 구성을 보면 60세 이상이 ${elderly}%, 20~50대가 ${prime}%, 19세 이하가 ${youth}%를 차지하며 ` +
      `가장 인구가 많은 연령대는 ${band}입니다. ${reading}`,
    )
  }

  // 4) 세대 분화 — 인구와 세대수의 증감 괴리
  //
  // 임계값은 229개 시군구의 실제 분포에서 잡았다(중앙값 1.00, 25% 0.74, 75% 1.27).
  // 거의 모든 지역에서 세대수가 인구보다 빠르게 늘고 있어(1인 가구 증가라는 전국 추세),
  // "분화가 있는가"가 아니라 "얼마나 빠른가"로 나눠야 지역별로 의미 있게 갈린다.
  if (d.householdDivergence !== null && d.periodMonths >= 2) {
    const gap = d.householdDivergence
    const period = `최근 ${d.periodMonths}개월`
    const pp = `${Math.abs(gap).toFixed(1)}%포인트`

    if (gap >= 1.3) {
      paragraphs.push(
        `${period} 동안 세대수가 인구보다 ${pp} 빠르게 늘었습니다. 전국 시군구 가운데 가구 분화가 빠른 축에 속하며, ` +
        `한 가구에 사는 사람 수가 뚜렷하게 줄고 있다는 뜻입니다. 총인구만 보면 놓치는 신호로, ` +
        `소형 주거와 1인 가구 대상 업종의 수요가 커지는 국면입니다.`,
      )
    } else if (gap >= 0.8) {
      paragraphs.push(
        `${period} 동안 세대수가 인구보다 ${pp} 빠르게 늘어 전국 평균 수준의 가구 분화가 진행 중입니다. ` +
        `1~2인 가구 비중이 완만하게 높아지는 흐름으로, 중소형 주거 수요가 상대적으로 견조한 구간입니다.`,
      )
    } else if (gap > 0) {
      paragraphs.push(
        `${period} 동안 세대수가 인구보다 ${pp} 빠르게 늘었지만 그 격차는 전국에서 작은 편입니다. ` +
        `가구 구성이 비교적 안정적으로 유지되고 있어, 주거 수요의 성격이 급격히 바뀔 가능성은 낮습니다.`,
      )
    } else {
      paragraphs.push(
        `${period} 동안 인구가 세대수보다 ${pp} 빠르게 늘었습니다. 가구당 인원이 오히려 늘고 있다는 뜻으로, ` +
        `전국 추세와 반대되는 드문 경우입니다. 가족 단위 유입이 우세한 지역으로 볼 수 있습니다.`,
      )
    }
  }

  // 5) 가구 구성과 성비
  const hh = latest.householdSize.toFixed(2)
  let hhText: string
  if (latest.householdSize >= 2.4) {
    hhText = `세대당 인구는 ${hh}명으로 가구 규모가 큰 편이라 가족 단위 거주 비중이 높게 나타납니다.`
  } else if (latest.householdSize >= 2.0) {
    hhText = `세대당 인구는 ${hh}명으로 전국 평균 수준의 가구 구성을 보입니다.`
  } else {
    hhText = `세대당 인구는 ${hh}명으로 1~2인 가구 비중이 높아 소형 주거 수요가 두드러집니다.`
  }
  if (latest.female > 0) {
    const ratio = (latest.male / latest.female) * 100
    hhText += ratio >= 102
      ? ` 성비는 ${ratio.toFixed(1)}로 남성이 다소 많은 편입니다.`
      : ratio <= 98
        ? ` 성비는 ${ratio.toFixed(1)}로 여성이 다소 많은 편입니다.`
        : ` 성비는 ${ratio.toFixed(1)}로 균형에 가깝습니다.`
  }
  paragraphs.push(hhText)

  return { verdict: buildVerdict(input, d), paragraphs }
}
