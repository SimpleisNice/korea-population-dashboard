import type { Metadata } from 'next'
import Link from 'next/link'
import { Database, BarChart2, TrendingUp, GitCompare, Map } from 'lucide-react'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: '서비스 소개 — 인구통계',
  description:
    '행정안전부 주민등록 인구통계 공개 데이터를 기반으로 전국 시군구 인구 현황, 추이, 연령 구조, 전입출 현황을 한눈에 확인할 수 있는 서비스입니다.',
}

const FEATURES = [
  {
    icon: BarChart2,
    title: '지역 순위',
    desc: '전국 시군구별 총인구, 전월 증감, 전년 증감률 기준으로 정렬하고 시도별로 필터링하여 한눈에 비교합니다.',
  },
  {
    icon: TrendingUp,
    title: '인구 트렌딩',
    desc: '최근 3·6·12개월 기간 인구 급증·급감 지역 TOP 10을 확인하여 부동산 시장의 인구 흐름을 파악합니다.',
  },
  {
    icon: Map,
    title: '인구 지도',
    desc: '17개 시도의 인구 증감을 색상으로 시각화하여 전국 인구 이동의 큰 그림을 직관적으로 보여줍니다.',
  },
  {
    icon: GitCompare,
    title: '지역 비교',
    desc: '관심 지역 두 곳을 나란히 비교하여 인구수, 세대수, 증감률, 연령 구조의 차이를 분석합니다.',
  },
]

export default function AboutPage() {
  return (
    <MobileShell>
      <Header title="서비스 소개" showBack backHref="/" />

      <article style={{ padding: '20px 16px 48px' }}>
        {/* 서비스 개요 */}
        <div
          className="rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%)',
            border: '1px solid rgba(37,99,235,0.12)',
            padding: '24px 20px',
            marginBottom: 16,
          }}
        >
          <div
            className="flex items-center gap-2"
            style={{ marginBottom: 12 }}
          >
            <Database size={18} style={{ color: 'var(--color-accent)' }} />
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              인구통계
            </h1>
          </div>
          <p
            className="text-[14px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
          >
            부동산 구매 전 꼭 확인해야 할 시군구별 인구 현황을 한눈에 보여주는 서비스입니다.
            행정안전부가 매월 공개하는 주민등록 인구통계 데이터를 기반으로, 전국 226개
            시군구의 인구 추이, 세대수, 연령 구조, 전입출 현황을 분석합니다.
          </p>
          <p
            className="text-[14px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            인구 변화는 부동산 수요, 상권 활성도, 지역 발전 가능성을 가늠하는 핵심 지표입니다.
            인구가 늘어나는 지역은 주거 수요 증가와 인프라 확충이 기대되고,
            인구가 줄어드는 지역은 부동산 가치 하락 리스크를 고려해야 합니다.
          </p>
        </div>

        {/* 주요 기능 */}
        <div
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
            style={{ color: 'var(--color-text-primary)', marginBottom: 16 }}
          >
            주요 기능
          </h2>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <div
                  className="flex items-center justify-center rounded-lg shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: 'var(--color-accent-light)',
                  }}
                >
                  <Icon size={18} style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3
                    className="text-[14px] font-semibold"
                    style={{ color: 'var(--color-text-primary)', marginBottom: 2 }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-[12px] leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 데이터 출처 */}
        <div
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
            데이터 출처
          </h2>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}
          >
            모든 인구 데이터는{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              행정안전부 주민등록 인구통계
            </strong>
            에서 제공하는 공개 데이터를 사용합니다. 매월 말 기준으로 업데이트되며,
            전국 시도 및 시군구 단위의 집계 통계입니다.
          </p>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 10 }}
          >
            본 서비스의 데이터는 개인을 식별할 수 없는 지역 단위 집계 데이터이며,
            통계 분석 및 시각화 목적으로만 활용됩니다.
          </p>
          <Link
            href="/methodology"
            className="text-[13px] font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            데이터 집계 방식과 지표 정의 자세히 보기 →
          </Link>
        </div>

        {/* 면책 조항 */}
        <div
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
            면책 조항
          </h2>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            본 서비스에서 제공하는 정보는 참고용이며, 부동산 투자 등 재정적 의사결정의
            근거로 사용할 경우 발생하는 손실에 대해 책임지지 않습니다.
            데이터의 정확성은 행정안전부 원본 데이터에 준하며,
            가공 과정에서 미미한 오차가 발생할 수 있습니다.
          </p>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link
            href="/"
            className="text-[13px] font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            홈으로 돌아가기
          </Link>
        </div>
      </article>
    </MobileShell>
  )
}
