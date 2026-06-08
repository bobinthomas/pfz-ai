import { Calendar, ChevronRight, MapPin } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer } from '@/components/ui/Drawer'
import { COASTS, coastById } from '@/lib/coast/coasts'
import { buildDateOptions } from '@/lib/format/dateOptions'
import { formatDay } from '@/lib/format/time'
import { useForecastSelectionStore } from '@/lib/forecast/forecastSelectionStore'

interface CoastDateSelectorsProps {
  stub?: boolean
}

function SelectorShell({
  icon,
  label,
  value,
  stub,
  onClick,
}: {
  icon: ReactNode
  label: string
  value: string
  stub?: boolean
  onClick?: () => void
}) {
  const inner = (
    <>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-soft text-ink">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11.5px] font-extrabold uppercase tracking-widest text-ink2">
          {label}
        </div>
        <div className="mt-0.5 font-display text-lg font-bold text-ink">{value}</div>
      </div>
      {!stub && (
        <ChevronRight className="h-5 w-5 shrink-0 text-ink2" aria-hidden />
      )}
    </>
  )

  if (stub) {
    return (
      <div
        className="flex min-h-[62px] items-center gap-3 rounded-2xl border-[1.5px] border-line bg-soft px-4 py-3"
        aria-disabled="true"
      >
        {inner}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[62px] w-full items-center gap-3 rounded-2xl border-[1.5px] border-line bg-card px-4 py-3 text-left transition-colors hover:bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      {inner}
    </button>
  )
}

export function CoastDateSelectors({ stub }: CoastDateSelectorsProps) {
  const { t, i18n } = useTranslation('today')
  const coastId = useForecastSelectionStore((s) => s.coastId)
  const date = useForecastSelectionStore((s) => s.date)
  const setCoastId = useForecastSelectionStore((s) => s.setCoastId)
  const setDate = useForecastSelectionStore((s) => s.setDate)

  const [coastOpen, setCoastOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)

  const coast = coastById(coastId)
  const dayLabel = formatDay(date, new Date(), i18n.language, (k, o) => t(k, o))
  const dateOptions = useMemo(() => buildDateOptions(), [])
  const translate = (k: string, o?: Record<string, string | number>) => t(k, o)

  return (
    <>
      <div className="mb-4 grid gap-3.5 sm:grid-cols-2" role="group" aria-label={t('yourCoast')}>
        <SelectorShell
          icon={<MapPin className="h-5 w-5" />}
          label={t('yourCoast')}
          value={coast.name}
          stub={stub}
          onClick={stub ? undefined : () => setCoastOpen(true)}
        />
        <SelectorShell
          icon={<Calendar className="h-5 w-5" />}
          label={t('day')}
          value={dayLabel}
          stub={stub}
          onClick={stub ? undefined : () => setDateOpen(true)}
        />
      </div>

      <Drawer
        open={coastOpen}
        onClose={() => setCoastOpen(false)}
        title={t('pickCoast')}
        icon={<MapPin className="h-5 w-5 text-teal" />}
      >
        <ul className="divide-y divide-line p-2">
          {COASTS.map((c) => {
            const selected = c.id === coastId
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setCoastId(c.id)
                    setCoastOpen(false)
                  }}
                  className={`flex min-h-[var(--touch-primary)] w-full items-center justify-between px-4 py-3 text-left font-display text-lg font-bold ${
                    selected ? 'bg-soft text-teal' : 'text-ink hover:bg-soft/70'
                  }`}
                  aria-pressed={selected}
                >
                  {c.name}
                  {selected && (
                    <span className="text-sm font-semibold text-teal">{t('selected')}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </Drawer>

      <Drawer
        open={dateOpen}
        onClose={() => setDateOpen(false)}
        title={t('pickDay')}
        icon={<Calendar className="h-5 w-5 text-teal" />}
      >
        <ul className="divide-y divide-line p-2">
          {dateOptions.map((iso) => {
            const selected = iso === date
            const label = formatDay(iso, new Date(), i18n.language, translate)
            return (
              <li key={iso}>
                <button
                  type="button"
                  onClick={() => {
                    setDate(iso)
                    setDateOpen(false)
                  }}
                  className={`flex min-h-[var(--touch-primary)] w-full items-center justify-between px-4 py-3 text-left font-display text-lg font-bold ${
                    selected ? 'bg-soft text-teal' : 'text-ink hover:bg-soft/70'
                  }`}
                  aria-pressed={selected}
                >
                  {label}
                  {selected && (
                    <span className="text-sm font-semibold text-teal">{t('selected')}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </Drawer>
    </>
  )
}
