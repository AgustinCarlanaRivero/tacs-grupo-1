import { z } from "zod"

// --- Tipos reutilizables ---
export const nonEmptyString = z.string().min(1)
export const positiveInt = z.number().int().positive()
export const nonNegativeInt = z.number().int().nonnegative()
export const positiveIntString = z.string().regex(/^[0-9]+$/, "Debe ser un número entero positivo")

// --- Params comunes ---
export const idParamSchema = z.object({
  id: nonEmptyString,
})

export const userIdParamSchema = z.object({
  userId: nonEmptyString,
})

export const stickerIdParamSchema = z.object({
  stickerId: positiveIntString,
})

export const postIdParamSchema = z.object({
  postId: nonEmptyString,
})

export const offerIdParamSchema = z.object({
  offerId: nonEmptyString,
})

// --- Query comunes ---
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const matchesQuerySchema = paginationQuerySchema.extend({
  stickerId: positiveIntString,
})

export const postFilterQuerySchema = z.object({
  type: z.enum(["DIRECT_TRADE", "AUCTION"]).optional(),
  state: nonEmptyString.optional(),
})

export const offerRoleQuerySchema = z.object({
  role: z.enum(["sent", "received", "all"]).default("all"),
})

export const stickerFilterQuerySchema = z.object({
  state: nonEmptyString.optional(),
  type: nonEmptyString.optional(),
  team: nonEmptyString.optional(),
  club: nonEmptyString.optional(),
})

export const notificationQuerySchema = z.object({
  unread: z.coerce.boolean().optional(),
})

export const stickerIdPathParamSchema = z.object({
  id: positiveIntString,
})

// --- Body comunes ---
export const collectionItemBodySchema = z.object({
  stickerId: positiveInt,
  quantity: z.number().int().positive().default(1),
})

export const updateCollectionQuantitySchema = z.object({
  quantity: nonNegativeInt,
})

export const missingStickerBodySchema = z.object({
  stickerId: positiveInt,
})

export const postCreateBodySchema = z.object({
  type: z.enum(["DIRECT_TRADE", "AUCTION"]),
  stickerId: positiveInt,
  minimumRequirements: z.array(collectionItemBodySchema).optional(),
})

export const postStateBodySchema = z.object({
  state: nonEmptyString,
})

export const offerCreateBodySchema = z.object({
  offered: z.array(collectionItemBodySchema).min(1),
})

export const offerStateBodySchema = z.object({
  state: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]),
})

export const ratingBodySchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})
