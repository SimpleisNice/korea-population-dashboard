/**
 * 데이터 방법론 `/methodology`
 *
 * 목적    수집·집계 방식과 지표 정의의 단일 출처.
 * 파라미터 없음
 * 렌더링  정적
 * 데이터  getTopLevelRegions · getAllRegions (지역 수·일반구 수)
 * 광고    없음
 * 색인    포함 · sitemap priority 0.5
 *
 * 지표 정의를 바꾸면 여기도 함께 고친다. 우리 연령 지표는 10세 단위 근사라
 * 통계청 공식 정의(65세/15세 경계)와 다르고, 그래서 공식 지표명을 쓰지 않는다.
 * 화면에 "65세 이상"·"15~64세"를 쓰면 계산과 어긋난다 (principles.md A2·B1).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllRegions, getTopLevelRegions } from '@/lib/data'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: '데이터 방법론 · 용어 안내 — 인구통계',
  description:
    '행정안전부 주민등록 인구통계를 어떻게 수집·집계하고, 총인구·세대수·세대당 인구·전월 증감·전년 동기 증감률(YoY)·성비·고령화 지표를 어떻게 정의하는지 설명합니다.',
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl"
      style={{
        backgroundColor: 'var(--color-bg)',
        boxShadow: 'var(--shadow-card)',
        padding: '20px',
        marginBottom: 16,
      }}
    >
      <h2
        className="text-[15px] font-bold"
        style={{ color: 'var(--color-text-primary)', marginBottom: 10 }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

const P: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
}

const TERMS: { term: string; desc: string }[] = [
  {
    term: '총인구',
    desc: '해당 시군구에 주민등록된 내국인 인구 수입니다. 실제 거주와 무관하게 주민등록 주소지를 기준으로 집계됩니다.',
  },
  {
    term: '세대수',
    desc: '주민등록상 세대(가구)의 수입니다. 1인 가구 증가 여부를 판단하는 기초 지표로 쓰입니다.',
  },
  {
    term: '세대당 인구',
    desc: '총인구를 세대수로 나눈 값입니다. 값이 작을수록 1~2인 가구 비중이 높다는 뜻이며, 소형 주거 수요를 가늠하는 데 활용됩니다.',
  },
  {
    term: '전월 증감',
    desc: '직전 달 대비 인구·세대수의 변화량입니다. 단기적인 유입·유출 흐름을 보여주지만 계절적 이동의 영향을 받을 수 있습니다.',
  },
  {
    term: '전년 동기 증감률 (YoY)',
    desc: '1년 전 같은 달과 비교한 변화율입니다. 계절 요인을 제거해 지역의 구조적 인구 추세를 파악하는 데 가장 신뢰도가 높습니다.',
  },
  {
    term: '성비',
    desc: '여성 100명당 남성 수입니다. 100을 넘으면 남성이, 밑돌면 여성이 많다는 의미로, 산업·대학 분포 등 지역 특성을 반영합니다.',
  },
  {
    term: '연령 구조',
    desc: '10세 단위 연령대별 인구 분포입니다(0~9세 … 80세 이상). 원본 데이터가 10세 단위로 제공되어 이보다 좁은 구간은 만들 수 없습니다.',
  },
  {
    term: '고령화 지수',
    desc: '60세 이상 인구를 0~19세 인구로 나눈 값(×100)입니다. 통계청 「노령화지수」는 65세 이상 ÷ 0~14세로 정의되므로 값이 다릅니다. 같은 이름을 쓰지 않는 이유입니다.',
  },
  {
    term: '생산가능 비율',
    desc: '20~59세 인구가 총인구에서 차지하는 비율입니다. 통계청 「생산연령인구」는 15~64세 기준이므로 값이 다릅니다.',
  },
  {
    term: '60세 이상 비율',
    desc: '60세 이상 인구가 총인구에서 차지하는 비율입니다. 통계청 「고령인구」 기준인 65세 이상과는 다릅니다. 비중이 높을수록 고령화가 진행된 지역으로, 장기 수요 전망에 영향을 줍니다.',
  },
]

export default function MethodologyPage() {
  // 지역 수는 문구에 하드코딩하지 않고 데이터에서 가져온다 (docs/principles.md B1)
  const sigunguCount = getTopLevelRegions().length
  const districtCount = getAllRegions().length - sigunguCount
  return (
    <MobileShell>
      <Header title="데이터 방법론" showBack backHref="/about" />

      <article style={{ padding: '20px 16px 48px' }}>
        <p
          className="text-[13px] leading-relaxed"
          style={{ ...P, marginBottom: 16 }}
        >
          본 서비스가 제공하는 모든 수치를 어떻게 수집·집계하고, 각 지표가 무엇을 의미하는지
          투명하게 설명합니다. 데이터를 해석할 때 참고하세요.
        </p>

        <Card title="데이터 출처와 갱신 주기">
          <p className="text-[13px] leading-relaxed" style={{ ...P, marginBottom: 8 }}>
            모든 인구 데이터는{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              행정안전부 주민등록 인구통계
            </strong>
            의 공개 데이터를 사용합니다. 매월 말일 기준으로 집계되어 다음 달에 공표되며,
            새 데이터가 공개되면 서비스에 반영합니다.
          </p>
          <p className="text-[13px] leading-relaxed" style={P}>
            주민등록 인구는 실제 거주가 아닌 <em>주소지 등록</em>을 기준으로 하므로, 대학가·산업단지 등
            실거주와 등록지가 다른 지역에서는 체감 인구와 차이가 날 수 있습니다.
          </p>
        </Card>

        <Card title="집계 단위와 경계 변경 처리">
          <p className="text-[13px] leading-relaxed" style={{ ...P, marginBottom: 8 }}>
            집계 단위는 전국 <strong style={{ color: 'var(--color-text-primary)' }}>{sigunguCount}개 시군구</strong>입니다.
            수원시 장안구처럼 시 아래에 있는 일반구 {districtCount}곳은 상위 시에 이미 포함되어 있어
            전국·시도 합계와 순위에서는 중복 집계하지 않고, 해당 시의 상세 화면에서 따로 확인할 수 있습니다.
            시도 단위 집계는 지도·요약에만 사용하고, 순위·상세 페이지는 시군구 단위로 제공합니다.
          </p>
          <p className="text-[13px] leading-relaxed" style={{ ...P, marginBottom: 8 }}>
            행정구역 개편으로 지역 코드가 바뀐 경우에도 시계열이 끊기지 않도록 개편 전후 코드를
            하나의 지역으로 연결해 추이를 이어서 보여줍니다. 강원(2023년 6월), 군위군의 대구 편입
            (2023년 7월), 전북(2024년 1월), 광주광역시와 전라남도가 합쳐진 전남광주통합특별시
            (2026년 7월)가 여기에 해당합니다.
          </p>
          <p className="text-[13px] leading-relaxed" style={P}>
            다만 하나의 지역이 여러 개로 <em>나뉜</em> 경우에는 과거 인구를 새 지역에 나눠 붙일 근거가
            없어 시계열을 잇지 않습니다. 2026년 7월 인천 개편(중구·동구 → 제물포구·영종구,
            서구 → 서해구·검단구)이 그렇습니다. 폐지된 지역은 개편 시점까지의 이력을 그대로 두고
            해당 화면에 폐지 사실과 승계 지역을 표시하며, 새로 생긴 지역은 통계가 쌓이기 전까지
            전년 대비 증감률을 제공하지 않습니다.
          </p>
        </Card>

        <Card title="지표 정의">
          <dl className="space-y-3">
            {TERMS.map(({ term, desc }) => (
              <div key={term}>
                <dt
                  className="text-[13px] font-semibold"
                  style={{ color: 'var(--color-text-primary)', marginBottom: 2 }}
                >
                  {term}
                </dt>
                <dd className="text-[12px] leading-relaxed" style={P}>
                  {desc}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="해석 가이드">
          <ul className="space-y-2 text-[12px] leading-relaxed" style={P}>
            <li>
              • 단기(전월·3개월) 변화는 계절 이동이나 신규 입주 등 일시적 요인일 수 있으니,
              장기(전년 동기·12개월) 추세와 함께 봐야 합니다.
            </li>
            <li>
              • 인구가 늘어도 세대수가 더 빠르게 늘면 가구 규모가 줄어드는 것으로,
              1인 가구 중심의 성장일 수 있습니다.
            </li>
            <li>
              • 증감률(%)은 인구 규모가 작은 지역일수록 크게 흔들립니다.
              절대 증감량과 함께 판단하세요.
            </li>
          </ul>
        </Card>

        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <Link
            href="/about"
            className="text-[13px] font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            서비스 소개로 돌아가기
          </Link>
        </div>

        <Footer />
      </article>
    </MobileShell>
  )
}
