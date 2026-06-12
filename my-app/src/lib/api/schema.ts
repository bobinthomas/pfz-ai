import { z } from 'zod'

const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

const catchSchema = z.object({
  tier: z.enum(['good', 'ok', 'low', 'nodata']),
  score: z.number(),
})

const confidenceSchema = z.object({
  level: z.enum(['high', 'fair', 'low']),
  score: z.number(),
  reasons: z.array(z.string()),
})

const signalsSchema = z.object({
  sstC: z.number(),
  chlorophyll: z.number(),
})

const presenceSchema = z.object({
  boatCount: z.number().nullable(),
  bucket: z.enum(['quiet', 'some', 'busy', 'very_busy', 'unknown']),
  observedAt: z.string(),
  source: z.enum(['ais', 'vms', 'proxy', 'pfz_fleet', 'unknown']).optional(),
  confidence: z.enum(['high', 'fair', 'low']).optional(),
})

const catchShareSchema = z.object({
  level: z.enum(['good', 'fair', 'low', 'unknown']),
  reasonKey: z.string(),
})

const zoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  center: coordinatesSchema,
  distanceKm: z.number(),
  bearing: z.string(),
  etaMins: z.number(),
  depthM: z.tuple([z.number(), z.number()]),
  catch: catchSchema.optional(),
  confidence: confidenceSchema.optional(),
  signals: signalsSchema.optional(),
  species: z.array(z.string()).optional(),
  gear: z.array(z.string()).optional(),
  presence: presenceSchema.optional(),
  catchShare: catchShareSchema.optional(),
  dataStatus: z.enum(['ok', 'low_data']),
  reason: z.string().optional(),
})

export const forecastSchema = z.object({
  meta: z.object({
    generatedAt: z.string(),
    source: z.string(),
    ttlSeconds: z.number(),
  }),
  coast: z.object({
    id: z.string(),
    name: z.string(),
    harbour: coordinatesSchema,
  }),
  date: z.string(),
  boat: z
    .object({
      id: z.string(),
      name: z.string(),
      rangeKm: z.number(),
      gear: z.array(z.string()),
      maxDepthM: z.number(),
      fuelLitresPerKm: z.number().optional(),
    })
    .optional(),
  config: z
    .object({
      fuelPricePerLitre: z.number(),
      currency: z.string(),
    })
    .optional(),
  weather: z.object({
    state: z.enum(['calm', 'rough', 'severe']),
    windKts: z.number(),
    windDir: z.string(),
    waveM: z.number(),
    sstC: z.number(),
    severeWarning: z.boolean(),
  }),
  zones: z.array(zoneSchema),
  advisory: z
    .object({ kind: z.string(), text: z.string() })
    .nullable()
    .optional(),
  accuracy: z.object({
    windowDays: z.number(),
    correct: z.number(),
    history: z.array(z.boolean()),
  }),
})

export const problemDetailSchema = z.object({
  type: z.string(),
  title: z.string(),
  detail: z.string().optional(),
  status: z.number(),
  traceparent: z.string().optional(),
})

export type ForecastPayload = z.infer<typeof forecastSchema>
