import { problemDetailSchema } from './schema'
import type { ProblemDetail } from '@/domain/types'

export async function parseProblemDetail(response: Response): Promise<ProblemDetail> {
  const json: unknown = await response.json()
  return problemDetailSchema.parse(json)
}
