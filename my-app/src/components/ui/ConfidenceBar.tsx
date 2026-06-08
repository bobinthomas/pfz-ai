import type { ConfidenceLevel } from '@/domain/types'
import { confidenceDots } from '@/domain'
import { confidenceColor } from '@/lib/utils/tier'

interface ConfidenceBarProps {
  level: ConfidenceLevel
  label: string
  heading: string
  compact?: boolean
}

export function ConfidenceBar({
  level,
  label,
  heading,
  compact = false,
}: ConfidenceBarProps) {
  const filled = confidenceDots(level)
  const color = confidenceColor(level)

  const bar = (
    <div
      className={`overflow-hidden rounded-full bg-white/20 ${
        compact ? 'h-2 w-10' : 'h-2.5 min-w-[4.5rem] flex-1'
      }`}
      role="img"
      aria-label={`${heading}: ${label}`}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${(filled / 3) * 100}%`,
          backgroundColor: color,
        }}
      />
    </div>
  )

  if (compact) {
    return (
      <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-white/14 px-3 py-1.5 text-sm">
        <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-90">
          {heading}
        </span>
        <span className="font-display font-bold">{label}</span>
        {bar}
      </span>
    )
  }

  return (
    <div className="mt-3 rounded-xl bg-white/14 px-3 py-2.5">
      <div className="text-[10px] font-extrabold uppercase tracking-wide opacity-90">
        {heading}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
        <span className="font-display text-base font-bold">{label}</span>
        {bar}
      </div>
    </div>
  )
}
