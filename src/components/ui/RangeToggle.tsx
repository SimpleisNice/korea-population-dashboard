'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const OPTIONS = [
  { value: '6', label: '6개월' },
  { value: '12', label: '12개월' },
  { value: 'all', label: '전체' },
]

interface Props {
  current: string
}

export function RangeToggle({ current }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '12') params.delete('range')
    else params.set('range', value)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div
      className="flex gap-1 rounded-lg"
      style={{ backgroundColor: 'var(--color-surface)', padding: 3, display: 'inline-flex' }}
    >
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => handleClick(opt.value)}
          className="rounded-md text-[12px] font-semibold transition-all"
          style={{
            padding: '4px 10px',
            backgroundColor: current === opt.value ? 'var(--color-bg)' : 'transparent',
            color: current === opt.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            boxShadow: current === opt.value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
