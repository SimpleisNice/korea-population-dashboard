import type { Metadata } from 'next'
import { MobileShell } from '@/components/layout/MobileShell'
import { Header } from '@/components/layout/Header'
import { KoreaHeatmap } from '@/components/map/KoreaHeatmap'
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
      <div style={{ padding: '16px 16px 32px' }}>
        <p
          className="text-[13px]"
          style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}
        >
          시도를 탭하면 인구 현황을 확인할 수 있습니다. 색상이 진할수록 변화폭이 큽니다.
        </p>
        <KoreaHeatmap sidoStats={sidoStats} />
      </div>
    </MobileShell>
  )
}
