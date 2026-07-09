'use client'

import { useEffect, useRef } from 'react'

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
        data-ad-client="ca-pub-4466379680692265"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
