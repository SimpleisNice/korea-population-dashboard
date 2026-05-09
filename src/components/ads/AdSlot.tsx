'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface Props {
  slot?: string
  format?: string
  className?: string
}

const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
const defaultSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER

export function AdSlot({ slot = defaultSlot, format = 'auto', className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || initialized.current || !publisherId || !slot) return
    initialized.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // adsbygoogle not loaded yet
    }
  }, [visible, slot])

  if (!publisherId || !slot) {
    return (
      <div
        className={className}
        style={{
          minHeight: 60,
          borderRadius: 8,
          backgroundColor: 'var(--color-surface)',
          border: '1px dashed var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          광고
        </span>
      </div>
    )
  }

  return (
    <div ref={ref} className={className} style={{ minHeight: 60 }}>
      {visible && (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={publisherId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      )}
    </div>
  )
}
