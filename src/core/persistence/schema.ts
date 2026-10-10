import { z } from 'zod'
import type { SaveFile } from '../state/types.js'

const ResourceAmountSchema = z.object({
  materials: z.number(),
  energy: z.number(),
  researchData: z.number()
})

/**
 * Versioned save schema (v2). Validation runs after migration, so a save from
 * any earlier version is upgraded first and then checked against this shape.
 */
export const SaveFileSchema: z.ZodType<SaveFile, z.ZodTypeDef, unknown> = z.object({
  version: z.number().int().positive(),
  data: z.object({
    resources: ResourceAmountSchema,
    buildings: z.record(z.object({
      id: z.string(),
      buildingType: z.string().nullable(),
      level: z.number().int().nonnegative(),
      maxLevel: z.number().int().positive(),
      queuePosition: z.number().int().nonnegative().nullable(),
      endTime: z.number().nullable()
    })),
    research: z.record(z.object({
      id: z.string(),
      state: z.enum(['locked', 'available', 'researching', 'completed']),
      queuePosition: z.number().int().nonnegative().nullable(),
      endTime: z.number().nullable()
    })),
    buildingQueue: z.array(z.string()),
    researchQueue: z.array(z.string()),
    clanEvent: z.object({
      eventEndTime: z.number(),
      playerPoints: z.number(),
      aiPoints: z.number(),
      aiProfile: z.enum(['rusher', 'grinder', 'lateBloomer']),
      pointLog: z.array(z.object({
        timestamp: z.number(),
        clan: z.enum(['player', 'ai']),
        source: z.string(),
        amount: z.number()
      })),
      cycle: z.number().int().positive(),
      produceAccumulator: z.number().nonnegative().default(0),
      lastResults: z.object({
        winner: z.enum(['player', 'ai']),
        playerPoints: z.number(),
        aiPoints: z.number(),
        reward: z.object({
          currency: z.number(),
          speedups: z.array(z.string())
        }),
        endedAt: z.number()
      }).nullable()
    }),
    shop: z.object({
      currency: z.number().int().nonnegative(),
      inventory: z.array(z.object({
        id: z.string(),
        count: z.number().int().positive()
      }))
    }),
    lastSave: z.number(),
    version: z.number().int().positive()
  }),
  savedAt: z.number()
})

export const CURRENT_SAVE_VERSION = 2
