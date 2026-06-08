import type { ReactNode } from 'react'

interface PillProps {
  children: ReactNode
  color?: string
  bg?: string
  className?: string
}

export function Pill({ children, color, bg, className = '' }: PillProps) {
  return (
    <span
      className={`inline-flex min-h-[28px] items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-sm font-semibold ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  )
}
