import { Anchor, Layers, Map, Settings, Ship } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { LanguageMenu } from '@/components/ui/LanguageMenu'
import { useConnectivityStore } from '@/lib/offline/connectivity'

type NavKey = 'today' | 'zones' | 'trips' | 'settings'

const NAV: { key: NavKey; to: string; icon: typeof Map; labelKey: string }[] = [
  { key: 'today', to: '/today', icon: Map, labelKey: 'today' },
  { key: 'zones', to: '/zones', icon: Layers, labelKey: 'zones' },
  { key: 'trips', to: '/trips', icon: Ship, labelKey: 'trips' },
  { key: 'settings', to: '/settings', icon: Settings, labelKey: 'settings' },
]

export function NavBar({ active }: { active: NavKey }) {
  const { t } = useTranslation('common')
  const online = useConnectivityStore((s) => s.online)
  const [langOpen, setLangOpen] = useState(false)

  return (
    <nav className="mb-4" aria-label="Main">
      <div className="flex items-center gap-2 rounded-[18px] border-[1.5px] border-line bg-card px-4 py-3">
        <div className="mr-3 flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-[11px] bg-navy text-white">
            <Anchor className="h-5 w-5" />
          </div>
          <b className="font-display text-[19px] font-extrabold tracking-wide text-ink">
            {t('appName')}
          </b>
        </div>

        <div className="mr-auto flex gap-1">
          {NAV.map(({ key, to, icon: Icon, labelKey }) => (
            <NavLink
              key={key}
              to={to}
              aria-label={t(labelKey)}
              className={({ isActive }) =>
                `inline-flex min-h-[var(--touch-min)] items-center gap-2 rounded-xl px-4 text-[15px] font-bold transition-colors ${
                  isActive || active === key
                    ? 'bg-navy text-white'
                    : 'text-ink2 hover:bg-soft'
                }`
              }
            >
              <Icon className="h-[19px] w-[19px]" aria-hidden />
              <span className="hidden min-[980px]:inline">{t(labelKey)}</span>
            </NavLink>
          ))}
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2 text-[13.5px] font-bold ${online ? 'text-ink2' : 'text-ink2'}`}
          aria-live="polite"
        >
          <i
            className={`inline-block h-2.5 w-2.5 rounded-full ${online ? 'bg-good' : 'bg-ink2'}`}
            aria-hidden
          />
          <span className="hidden sm:inline">
            {online ? t('live') : t('offline')}
          </span>
        </span>

        <LanguageMenu
          open={langOpen}
          onToggle={() => setLangOpen((o) => !o)}
          onClose={() => setLangOpen(false)}
        />
      </div>
    </nav>
  )
}
