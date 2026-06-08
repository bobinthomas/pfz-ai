import { todayIsoDate } from './time'

/** Yesterday through +3 days from the given calendar day. */
export function buildDateOptions(now = new Date(), pastDays = 1, futureDays = 3): string[] {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const options: string[] = []
  for (let offset = -pastDays; offset <= futureDays; offset++) {
    const d = new Date(base)
    d.setDate(base.getDate() + offset)
    options.push(todayIsoDate(d))
  }
  return options
}
