import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import calm from '@/mocks/fixtures/forecast.calm.json'
import type { Forecast } from '@/domain/types'
import '@/lib/i18n/config'
import { CourseMap } from './CourseMap'

const forecast = calm as Forecast

describe('CourseMap presence indicators', () => {
  it('shows boat counts on zone markers', () => {
    render(
      <CourseMap
        coast={forecast.coast}
        zones={forecast.zones}
        boat={forecast.boat!}
        weather={forecast.weather}
      />,
    )

    expect(screen.getByText('~2')).toBeInTheDocument()
    expect(screen.getByText('~4')).toBeInTheDocument()
    expect(screen.getByText('~1')).toBeInTheDocument()
    expect(screen.getByText('~7')).toBeInTheDocument()
  })
})
