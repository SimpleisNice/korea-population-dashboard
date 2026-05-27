'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'motion/react'

interface Props {
  value: number
  className?: string
  style?: React.CSSProperties
  formatter?: (n: number) => string
  /** 소수점 자릿수 (정수 포맷 대신 사용) */
  toFixed?: number
  /** 애니메이션 총 시간(초), 기본 1.2s */
  duration?: number
}

/**
 * 토스 스타일 숫자 카운트업 컴포넌트.
 * 뷰포트에 진입하는 순간 0 → value 까지 easeOut spring으로 애니메이션.
 */
export function AnimatedNumber({
  value,
  className,
  style,
  formatter,
  toFixed,
  duration = 1.2,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(() =>
    formatter ? formatter(0) : (0).toLocaleString('ko-KR'),
  )
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!isInView || hasStarted.current) return
    hasStarted.current = true

    const controls = animate(0, value, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate(latest) {
        if (toFixed !== undefined) {
          setDisplay(latest.toFixed(toFixed))
        } else {
          const rounded = Math.round(latest)
          setDisplay(
            formatter ? formatter(rounded) : rounded.toLocaleString('ko-KR'),
          )
        }
      },
    })

    return () => controls.stop()
  }, [isInView, value, duration, formatter, toFixed])

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  )
}
