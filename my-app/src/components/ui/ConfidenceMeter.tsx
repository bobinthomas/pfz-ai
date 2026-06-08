interface ConfidenceMeterProps {
  dots: number
  color?: string
}

export function ConfidenceMeter({ dots, color = 'var(--good)' }: ConfidenceMeterProps) {
  return (
    <span className="inline-flex gap-1" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: i <= dots ? color : 'var(--line2)',
          }}
        />
      ))}
    </span>
  )
}
