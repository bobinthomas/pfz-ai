export function tierPillLabel(tier: string, t: (k: string) => string) {
  const map: Record<string, string> = {
    good: 'goodFishing',
    ok: 'someFish',
    low: 'fewFish',
  }
  return t(map[tier] ?? 'fewFish')
}
