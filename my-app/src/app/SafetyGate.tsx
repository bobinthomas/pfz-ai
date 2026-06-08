import type { ReactNode } from 'react'
import { useSafetyStore } from '@/lib/offline/safetyStore'

interface SafetyGateProps {
  children: ReactNode
}

export function SafetyGate({ children }: SafetyGateProps) {
  const severe = useSafetyStore((s) => s.severeWarning)

  return (
    <div data-severe={severe ? 'true' : 'false'} className="min-h-svh">
      {children}
    </div>
  )
}
