import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import stale from '@/mocks/fixtures/forecast.stale.json'
import type { Boat, Forecast } from '@/domain/types'
import '@/lib/i18n/config'
import { ZonesRail } from './ZonesRail'

const forecast = stale as Forecast
const boat = forecast.boat as Boat

describe('ZonesRail staleness alignment', () => {
  it('very_stale: Good fishing tab shows catch pill and capped Low confidence on card', () => {
    render(
      <ZonesRail
        zones={forecast.zones}
        boat={boat}
        dataStaleness="very_stale"
        onSelect={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('tab', { name: /Good fishing/i }))

    const panel = screen.getByRole('tabpanel')
    expect(panel.textContent).toMatch(/Good fishing/i)
    expect(panel.textContent).toMatch(/How sure.*Low/i)
  })
})
