import { z } from "zod"
import { isoDateTime, nonEmptyString } from "../../../shared/validation/common"

/** POST /users/:userId/ratings */
export const ratingCreateRequestSchema = z.object({
    score: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
}).meta({ id: "RatingCreateRequest" })

export const ratingResponseSchema = z.object({
    id: nonEmptyString,
    reviewerId: nonEmptyString,
    revieweeId: nonEmptyString,
    score: z.number().int().min(1).max(5),
    comment: z.string(),
    createdAt: isoDateTime,
}).meta({ id: "Rating" })
