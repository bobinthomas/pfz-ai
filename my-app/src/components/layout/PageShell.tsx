import type { ReactNode } from 'react'
import { NavBar } from '@/components/layout/NavBar'
import { LanguageGate } from '@/components/ui/LanguageGate'
import { useLanguageStore } from '@/lib/i18n/languageStore'

type NavKey = 'today' | 'zones' | 'trips' | 'settings'

interface PageShellProps {
  active: NavKey
  children: ReactNode
  /** Extra bottom padding for floating FAB (Today only). */
  fabPad?: boolean
}

export function PageShell({ active, children, fabPad }: PageShellProps) {
  const language = useLanguageStore((s) => s.language)

  if (!language) {
    return <LanguageGate />
  }

  return (
    <div className={`min-h-svh bg-bg ${fabPad ? 'pb-28' : 'pb-8'}`}>
      <div
        className={`relative z-[1] mx-auto max-w-[var(--max-width)] px-4 pt-4 sm:px-6 ${
          fabPad ? 'pb-[70px]' : 'pb-8'
        }`}
      >
        <NavBar active={active} />
        {children}
      </div>
    </div>
  )
}
