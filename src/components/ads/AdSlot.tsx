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

// 스크립트 삽입 여부를 모듈 단위로 추적 (한 번만 로드)
let scriptInjected = false

function loadAdSenseScript(): Promise<void> {
  if (scriptInjected) return Promise.resolve()
  scriptInjected = true

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve()
    script.onerror = () => resolve() // 실패해도 진행
    document.head.appendChild(script)
  })
}

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

    loadAdSenseScript().then(() => {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch {
        // ignore
      }
    })
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
