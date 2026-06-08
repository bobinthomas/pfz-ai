interface StatTileProps {
  label: string
  value: string
  sub?: string
}

export function StatTile({ label, value, sub }: StatTileProps) {
  return (
    <div className="rounded-xl bg-soft px-3 py-2.5">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink2">
        {label}
      </div>
      <div className="mt-0.5 font-display text-lg font-bold text-ink">{value}</div>
      {sub && <div className="text-xs text-ink2">{sub}</div>}
    </div>
  )
}
