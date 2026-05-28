interface Props {
  height?: number | string
  width?: number | string
  rounded?: number | string
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ height = 16, width = '100%', rounded = 8, className, style }: Props) {
  return (
    <div
      className={className}
      style={{
        height,
        width,
        borderRadius: rounded,
        backgroundColor: 'var(--color-border)',
        opacity: 0.6,
        animation: 'skeleton-pulse 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  )
}
