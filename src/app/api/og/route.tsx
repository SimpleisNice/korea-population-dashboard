import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const name = searchParams.get('name') ?? '지역'
  const sido = searchParams.get('sido') ?? ''
  const popRaw = searchParams.get('pop')
  const changeRaw = searchParams.get('change')

  const pop = popRaw ? parseInt(popRaw).toLocaleString('ko-KR') : null
  const change = changeRaw ? parseInt(changeRaw) : null
  const changeLabel = change != null
    ? (change > 0 ? `▲ ${change.toLocaleString('ko-KR')}명` : change < 0 ? `▼ ${Math.abs(change).toLocaleString('ko-KR')}명` : '변동 없음')
    : null
  const changeColor = change != null && change > 0 ? '#16a34a' : change != null && change < 0 ? '#dc2626' : '#6b7280'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          padding: '60px 72px',
          fontFamily: 'sans-serif',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 22, color: '#6b7280', fontWeight: 500 }}>
            {sido} · 인구통계
          </span>
          <span style={{ fontSize: 72, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
            {name}
          </span>
        </div>

        {pop && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              backgroundColor: '#f9fafb',
              borderRadius: 20,
              padding: '32px 40px',
            }}
          >
            <span style={{ fontSize: 18, color: '#6b7280', fontWeight: 500 }}>총 인구</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontSize: 52, fontWeight: 700, color: '#111827' }}>{pop}명</span>
              {changeLabel && (
                <span style={{ fontSize: 22, fontWeight: 600, color: changeColor }}>
                  {changeLabel} (전월비)
                </span>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 20, color: '#9ca3af' }}>행안부 주민등록 인구통계</span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#2563eb',
              letterSpacing: '-0.02em',
            }}
          >
            인구통계.kr
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
