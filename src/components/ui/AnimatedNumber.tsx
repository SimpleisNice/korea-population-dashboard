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

function format(n: number, formatter?: (n: number) => string, toFixed?: number): string {
  if (toFixed !== undefined) return n.toFixed(toFixed)
  return formatter ? formatter(n) : n.toLocaleString('ko-KR')
}

/**
 * 토스 스타일 숫자 카운트업 컴포넌트.
 * 뷰포트에 진입하는 순간 0 → value 까지 easeOut spring으로 애니메이션.
 *
 * 초기 상태는 0이 아니라 **실제 값**이다. 0으로 두면 서버 렌더링 HTML에 0이 박혀
 * 검색·심사 크롤러가 지역 페이지의 핵심 수치를 전부 0으로 읽는다.
 * 애니메이션은 하이드레이션 이후에만 동작하므로 크롤러가 보는 값은 항상 실제 값이다.
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
  const [display, setDisplay] = useState(() => format(value, formatter, toFixed))
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!isInView || hasStarted.current) return
    hasStarted.current = true

    const controls = animate(0, value, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate(latest) {
        setDisplay(format(toFixed !== undefined ? latest : Math.round(latest), formatter, toFixed))
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
