export interface CoastOption {
  id: string
  name: string
}

export const COASTS: CoastOption[] = [
  { id: 'kochi', name: 'Kochi, Ernakulam' },
  { id: 'alappuzha', name: 'Alappuzha' },
  { id: 'kannur', name: 'Kannur' },
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram' },
]

export function coastById(id: string): CoastOption {
  return COASTS.find((c) => c.id === id) ?? COASTS[0]
}
