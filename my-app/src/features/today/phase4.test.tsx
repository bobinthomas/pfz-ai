import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import type { Boat, Forecast, Weather, Zone } from '@/domain/types'
import '@/lib/i18n/config'
import { ZoneDetailDrawer } from './ZoneDetailDrawer'
import { ZonesRail } from './ZonesRail'

const forecast = calm as Forecast
const boat = forecast.boat as Boat
const weather = forecast.weather as Weather
const okZone = forecast.zones.find((z) => z.dataStatus === 'ok') as Zone

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('Phase 4 overlays', () => {
  it('zone drawer shows species, why-fish, gear badge, and actions', () => {
    renderWithQuery(
      <ZoneDetailDrawer
        zone={okZone}
        letter="A"
        boat={boat}
        weather={weather}
        onClose={() => {}}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Why the fish are here')).toBeInTheDocument()
    expect(screen.getByText("What you'll catch").nextElementSibling).toHaveTextContent(
      'Mackerel, Tuna',
    )
    expect(screen.getByText('YOUR NET')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Go to this spot/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save spot/i })).toBeInTheDocument()
    expect(screen.getByText(/14 kts/)).toBeInTheDocument()
  })

  it('low_data zone is not a button and does not open drawer', () => {
    const lowData = forecast.zones.find((z) => z.dataStatus === 'low_data') as Zone
    const onSelect = vi.fn()

    render(
      <ZonesRail
        zones={forecast.zones}
        boat={boat}
        dataStaleness="fresh"
        onSelect={onSelect}
      />,
    )

    fireEvent.click(screen.getByRole('tab', { name: /No reading/i }))

    const lowCard = screen
      .getByRole('tabpanel')
      .querySelector('[aria-disabled="true"]')
    expect(lowCard?.tagName).toBe('DIV')
    expect(screen.queryByRole('button', { name: new RegExp(lowData.name) })).toBeNull()
  })

  it('severe state disables zone taps', () => {
    const onSelect = vi.fn()
    render(
      <ZonesRail
        zones={forecast.zones}
        boat={boat}
        disabled
        dataStaleness="fresh"
        onSelect={onSelect}
      />,
    )

    const firstOk = screen.getByRole('button', { name: new RegExp(okZone.name) })
    fireEvent.click(firstOk)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
