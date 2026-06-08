import { Check, Ship } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Drawer } from '@/components/ui/Drawer'
import { BOAT_CATALOG } from '@/lib/boat/boats'
import { useBoatStore } from '@/lib/boat/boatStore'

interface BoatPickerDrawerProps {
  open: boolean
  onClose: () => void
}

export function BoatPickerDrawer({ open, onClose }: BoatPickerDrawerProps) {
  const { t } = useTranslation(['settings', 'gear', 'today'])
  const boatId = useBoatStore((s) => s.boatId)
  const setBoatId = useBoatStore((s) => s.setBoatId)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t('settings:pickBoat')}
      icon={
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-soft text-teal">
          <Ship className="h-5 w-5" />
        </div>
      }
    >
      <ul className="px-3 py-3" role="listbox" aria-label={t('settings:pickBoat')}>
        {BOAT_CATALOG.map((boat) => {
          const selected = boat.id === boatId
          return (
            <li key={boat.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setBoatId(boat.id)
                  onClose()
                }}
                className={`mb-2 flex min-h-[var(--touch-primary)] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                  selected
                    ? 'border-teal bg-teal/5 ring-1 ring-teal/30'
                    : 'border-line bg-card hover:bg-soft'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg font-bold text-ink">
                    {boat.name}
                  </div>
                  <div className="text-sm text-ink2">
                    {boat.id} · {t('today:reaches', { km: boat.rangeKm })} ·{' '}
                    {boat.gear.map((g) => t(`gear:${g}`)).join(' · ')}
                  </div>
                </div>
                {selected && <Check className="h-5 w-5 shrink-0 text-teal" />}
              </button>
            </li>
          )
        })}
      </ul>
    </Drawer>
  )
}
