'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

const PUBLISHER_ID = 'ca-pub-4466379680692265'

interface Props {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  style?: React.CSSProperties
  className?: string
  /**
   * Only render the ad when the surrounding page actually has publisher content.
   * Pass `false` for empty/loading/navigation states so AdSense never sees an ad
   * unit on a "게시자 콘텐츠가 없는 화면".
   */
  enabled?: boolean
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

export function AdSlot({ slot, format = 'auto', style, className, enabled = true }: Props) {
  const pushed = useRef(false)
  const active = enabled && Boolean(slot)

  useEffect(() => {
    if (!active || pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // adsbygoogle not loaded yet
    }
  }, [active])

  // Never emit an ad unit with an unconfigured slot or on a content-less screen —
  // both are flagged by AdSense as ads on pages without publisher content.
  if (!active) return null

  return (
    <div className={className} style={{ overflow: 'hidden', ...style }}>
      {/*
        adsbygoogle.js 는 루트 레이아웃이 아니라 여기서 로드한다.
        전역 로드 시 자동 광고가 콘텐츠 얇은 화면(지도·비교 빈 상태·지역 상세)에도
        광고를 삽입해 "게시자 콘텐츠가 없는 화면" 위반이 재발한다.
        여기서 로드하면 광고 유닛이 실제로 렌더되는 페이지에만 스크립트가 존재하므로,
        대시보드에서 자동 광고가 켜져 있더라도 다른 화면에는 삽입될 수 없다.
        id 로 중복 주입이 방지된다.
      */}
      <Script
        id="adsbygoogle-init"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <span
        style={{
          display: 'block',
          textAlign: 'center',
          fontSize: 10,
          lineHeight: 1,
          letterSpacing: '0.06em',
          color: 'var(--color-text-secondary)',
          opacity: 0.5,
          marginBottom: 4,
        }}
      >
        광고
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
