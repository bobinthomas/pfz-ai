import { Compass } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Boat, Coast, StalenessLevel, Zone } from '@/domain'
import type { Weather } from '@/domain/types'
import { CourseMap } from './CourseMap'

interface BestSpotSectionProps {
  coast: Coast
  zones: Zone[]
  boat: Boat
  weather: Weather
  dataStaleness?: StalenessLevel
}

export function BestSpotSection({
  coast,
  zones,
  boat,
  weather,
  dataStaleness,
}: BestSpotSectionProps) {
  const { t } = useTranslation('today')

  return (
    <section aria-labelledby="best-spot-heading">
      <div className="mb-2.5 flex items-center gap-2.5 px-1">
        <Compass className="h-[19px] w-[19px] text-ink2" aria-hidden />
        <h2 id="best-spot-heading" className="font-display text-[19px] font-bold text-ink">
          {t('best')}
        </h2>
      </div>

      <CourseMap
        coast={coast}
        zones={zones}
        boat={boat}
        weather={weather}
        dataStaleness={dataStaleness}
        size="compact"
      />
    </section>
  )
}
