import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
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
        <FadeIn>
          <KoreaHeatmap sidoStats={sidoStats} />
        </FadeIn>
      </div>
    </MobileShell>
  )
}
