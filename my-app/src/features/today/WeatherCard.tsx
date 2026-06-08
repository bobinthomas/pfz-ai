import { Clock, Sun, Thermometer, Waves, Wind } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ForecastMeta, Weather, WeatherVerdict } from '@/domain/types'
import type { StalenessLevel } from '@/domain/staleness'
import { formatRelativeTime } from '@/lib/format/time'

interface WeatherCardProps {
  weather: Weather
  meta: ForecastMeta
  weatherVerdict: WeatherVerdict
  dataStaleness: StalenessLevel
  isOffline?: boolean
}

export function WeatherCard({
  weather,
  meta,
  weatherVerdict,
  dataStaleness,
  isOffline,
}: WeatherCardProps) {
  const { t } = useTranslation('today')
  const [updatedLabel, setUpdatedLabel] = useState(() =>
    formatRelativeTime(meta.generatedAt, new Date(), (k, o) => t(k, o)),
  )

  useEffect(() => {
    const refresh = () =>
      setUpdatedLabel(
        formatRelativeTime(meta.generatedAt, new Date(), (k, o) => t(k, o)),
      )
    refresh()
    const id = setInterval(refresh, 60000)
    return () => clearInterval(id)
  }, [meta, t])

  const warn = dataStaleness !== 'fresh' || isOffline
  const verdictKey =
    weatherVerdict === 'unsafe'
      ? 'weatherVerdictUnsafe'
      : weatherVerdict === 'caution'
        ? 'weatherVerdictCaution'
        : 'weatherVerdictSafe'

  return (
    <section aria-labelledby="weather-heading">
      <div className="mb-2.5 flex items-center gap-2.5 px-1">
        <Waves className="h-[19px] w-[19px] text-ink2" aria-hidden />
        <h2 id="weather-heading" className="font-display text-[19px] font-bold text-ink">
          {t('sea')}
        </h2>
        <span className="rounded-[var(--radius-pill)] bg-soft px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-ink2">
          {t('supporting')}
        </span>
        <span
          className={`ml-auto inline-flex items-center gap-1.5 text-[13px] font-bold ${
            warn ? 'text-caution' : 'text-ink2'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          {isOffline ? t('common:offline') : `${t('updated')} ${updatedLabel}`}
        </span>
      </div>
      <div className="rounded-[20px] border-[1.5px] border-line bg-card p-4">
        <div className="flex items-center gap-3.5">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[15px] bg-soft text-teal">
            {weatherVerdict !== 'safe' ? (
              <Wind className="h-[26px] w-[26px]" />
            ) : (
              <Sun className="h-[26px] w-[26px]" />
            )}
          </div>
          <div>
            <div className="font-display text-[21px] font-bold text-ink">
              {t(verdictKey)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-5 border-t border-line pt-4">
          <WxStat icon={<Waves className="h-3.5 w-3.5" />} label={t('waves')} value={`${weather.waveM} m`} />
          <WxStat
            icon={<Wind className="h-3.5 w-3.5" />}
            label={t('wind')}
            value={`${weather.windKts} kts ${weather.windDir}`}
          />
          <WxStat
            icon={<Thermometer className="h-3.5 w-3.5" />}
            label={t('water')}
            value={`${weather.sstC}°C`}
          />
        </div>
      </div>
    </section>
  )
}

function WxStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-ink2">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display text-[17px] font-bold text-ink">{value}</div>
    </div>
  )
}
