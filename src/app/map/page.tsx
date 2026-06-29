import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { KoreaHeatmap } from '@/components/map/KoreaHeatmap'
import { FadeIn } from '@/components/ui/FadeIn'
import { getSidoStats } from '@/lib/data'

export const metadata: Metadata = {
  title: '인구 지도 — 시도별 인구 현황',
  description: '대한민국 17개 시도의 인구 증감을 지도로 확인하세요.',
}

export default function MapPage() {
  const sidoStats = getSidoStats()

  return (
    <MobileShell>
      <Header title="인구 지도" showSearch />
      <div style={{ padding: '12px 16px 32px' }}>
        {/* 페이지 설명 */}
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
        >
          17개 시도의 전월 대비 인구 증감을 색상으로 표현한 지도입니다.
          파란색 계열은 인구 증가, 붉은색 계열은 인구 감소를 나타냅니다.
          시도를 선택하면 해당 지역의 상세 정보를 확인할 수 있습니다.
        </p>

        <FadeIn>
          <KoreaHeatmap sidoStats={sidoStats} />
        </FadeIn>

        {/* 해설 */}
        <div
          className="rounded-xl"
          style={{
            backgroundColor: 'var(--color-bg)',
            boxShadow: 'var(--shadow-card)',
            padding: '20px',
            marginTop: 20,
          }}
        >
          <h2
            className="text-[14px] font-bold"
            style={{ color: 'var(--color-text-primary)', marginBottom: 8 }}
          >
            인구 이동의 큰 그림
          </h2>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            대한민국의 인구는 수도권 집중, 지방 소멸이라는 큰 흐름 속에 있습니다.
            세종시, 경기 남부 등 신도시 개발 지역으로의 인구 유입이 두드러지며,
            비수도권 지역에서는 고령화와 함께 인구 감소가 가속화되고 있습니다.
            지도를 통해 전국적인 인구 흐름을 한눈에 파악해 보세요.
          </p>
        </div>

        <Footer />
      </div>
    </MobileShell>
  )
}
