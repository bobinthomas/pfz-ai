import { useDevPreviewStore } from '@/lib/dev/devPreviewStore'
import { useBoatStore } from '@/lib/boat/boatStore'
import { useForecastSelectionStore } from '@/lib/forecast/forecastSelectionStore'
import { useForecast } from './queries'

export function useAppForecast() {
  const fixture = useDevPreviewStore((s) => s.fixture)
  const coastId = useForecastSelectionStore((s) => s.coastId)
  const date = useForecastSelectionStore((s) => s.date)
  const boatId = useBoatStore((s) => s.boatId)

  return useForecast({ coastId, date, boatId, fixture })
}
