import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { SkipLink } from '@/components/ui/SkipLink'
import { SafetyGate } from './SafetyGate'

export function AppShell() {
  return (
    <SafetyGate>
      <SkipLink />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </SafetyGate>
  )
}
