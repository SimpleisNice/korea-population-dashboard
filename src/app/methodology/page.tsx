import type { Metadata } from 'next'
import Link from 'next/link'
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
    term: '연령 구조 · 고령화',
    desc: '5세 또는 10세 단위 연령대별 인구 분포입니다. 65세 이상 비중이 높을수록 고령화가 진행된 지역으로, 장기 수요 전망에 영향을 줍니다.',
  },
]

export default function MethodologyPage() {
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
            집계 단위는 전국 <strong style={{ color: 'var(--color-text-primary)' }}>226개 시군구</strong>입니다.
            17개 시도 상위 집계는 지도·요약에만 사용하고, 순위·상세 페이지는 시군구 단위로 제공합니다.
          </p>
          <p className="text-[13px] leading-relaxed" style={P}>
            행정구역 개편으로 지역 코드가 바뀐 경우(예: 강원 2023년 6월, 전북 2024년 1월)에도
            시계열이 끊기지 않도록 개편 전후 코드를 하나의 지역으로 연결해 추이를 이어서 보여줍니다.
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
