/**
 * 인구 트렌딩 `/trending`
 *
 * 목적    최근 인구 변화가 큰 지역 탐색.
 * 파라미터 없음 (기간 3/6/12개월은 클라이언트 상태 → P2-1)
 * 렌더링  정적
 * 데이터  getPopulationTrends(3·6·12) · getAvailableMonths
 * 광고    있음
 * 색인    포함 · sitemap priority 0.9
 *
 * 서버가 3개 기간을 모두 계산해 넘기고 클라이언트는 전환만 한다.
 * BottomNav 에는 /ranking 과 통합되어 별도 탭이 없다.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { BarChart2 } from 'lucide-react'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AdSlot } from '@/components/AdSlot'
import { TrendingClient } from '@/components/trending/TrendingClient'
import { getPopulationTrends, getAvailableMonths } from '@/lib/data'

export const metadata: Metadata = {
  title: '인구 트렌딩 — 인구통계',
  description: '최근 인구 급증·급감 지역 TOP 10. 3개월, 6개월, 12개월 기준으로 인구 변화가 큰 지역을 확인하세요.',
}

export default function TrendingPage() {
  const availableMonths = getAvailableMonths()
  const latestYm = availableMonths[availableMonths.length - 1]

  const data = {
    3: getPopulationTrends(3),
    6: getPopulationTrends(6),
    12: getPopulationTrends(12),
  } as const

  return (
    <MobileShell>
      <Header
        title="인구 트렌딩"
        showSearch
        right={
          <Link
            href="/ranking"
            className="flex items-center gap-1.5 rounded-full text-[13px] font-semibold"
            style={{
              backgroundColor: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
              padding: '6px 12px',
            }}
          >
            <BarChart2 size={14} />
            순위
          </Link>
        }
      />
      <div style={{ padding: '16px 16px 32px' }}>
        {/* 페이지 설명 */}
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
        >
          최근 인구 변화가 두드러진 지역을 3개월·6개월·12개월 기간별로 분석합니다.
          인구 급증·급감 패턴을 통해 부동산 시장의 수요 변화를 미리 파악해 보세요.
        </p>

        <TrendingClient data={data} latestYm={latestYm} />

        {/* 광고 */}
        <div style={{ marginTop: 24 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? ''} format="auto" />
        </div>

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
            className="text-[15px] font-bold"
            style={{ color: 'var(--color-text-primary)', marginBottom: 12 }}
          >
            부동산 선행 지표로서의 인구 트렌드 분석 가이드
          </h2>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
          >
            본 인구 트렌딩 페이지는 전국 200여 개 시군구 중 최근 가장 급격한 인구 이동을 겪고 있는 
            '핫스팟'을 3개월, 6개월, 12개월 단위로 포착합니다. 부동산 시장에서 인구의 급증과 급감은 
            해당 지역의 미래 가치를 미리 보여주는 강력한 선행 지표 역할을 합니다.
          </p>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
          >
            <strong>단기 트렌드(3개월~6개월)의 의미:</strong> 3개월 단위의 단기 급증은 주로 신규 
            대단지 아파트의 입주 물량 폭발, 혹은 특정 시기의 계절적 이동 요인에 기인하는 경우가 많습니다. 
            단기적으로 인구가 몰리는 곳은 신규 주거 인프라가 빠르게 형성되는 시점임을 시사하며, 
            초기 상권 선점이나 단기적인 전월세 수요 급증을 예측하는 데 유리한 지표가 됩니다. 
            반면, 단기 급감은 주변 지역에 대규모 신규 택지가 조성되어 수요를 뺏기고 있는 이른바 
            '빨대 효과'의 징후일 가능성이 높습니다.
          </p>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}
          >
            <strong>장기 트렌드(12개월)의 의미:</strong> 12개월(1년) 단위의 추세는 계절적 요인이 
            희석된 지역의 '구조적 성장세'를 의미합니다. 장기간에 걸쳐 꾸준히 상위권에 머무는 지역은 
            일회성 아파트 입주를 넘어 양질의 일자리(산업단지, 대기업 유치) 창출이나 GTX, KTX 등 
            광역 교통망 확충이라는 복합적이고 거대한 성장 엔진을 달고 있을 확률이 높습니다. 
            이는 곧 장기적인 자산 가치 상승과 안정적인 배후 수요 확장을 기대할 수 있는 펀더멘털이 
            강화되고 있다는 확실한 증거입니다.
          </p>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong>활용 팁:</strong> 트렌드 차트를 볼 때는 해당 지역이 단순히 랭킹에 올랐다는 
            사실뿐만 아니라, 증감의 '지속성'을 함께 평가해야 합니다. 특정 지역이 3개월 트렌드에서는 
            상위권인데 12개월 트렌드에서는 보이지 않는다면, 입주장 효과가 끝난 후 정체될 위험성을 
            내포합니다. 반대로 모든 기간에서 상위권에 포진하고 있다면 지역 전체가 팽창하는 강력한 
            상승 기류에 올라타 있다고 해석할 수 있습니다.
          </p>
        </div>

        <Footer />
      </div>
    </MobileShell>
  )
}
