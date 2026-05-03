'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  slot?: string
  className?: string
}

export function AdSlot({ slot = 'ca-pub-0000000000000000', className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

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

  return (
    <div
      ref={ref}
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
      {visible ? (
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          광고
        </span>
      ) : null}
    </div>
  )
}
