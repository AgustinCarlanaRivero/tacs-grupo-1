import { z } from "zod"
import {
    nonEmptyString,
    nonNegativeInt,
    paginatedResponseSchema,
    paginationQuerySchema,
    positiveInt,
    positiveIntString,
} from "../../../shared/validation/common"

/** GET /matches?stickerId=&page=&limit= */
export const matchesQuerySchema = paginationQuerySchema.extend({
    stickerId: positiveIntString,
})

export const matchResponseSchema = z.object({
    userId: nonEmptyString,
    username: z.string(),
    email: z.string(),
    quantity: nonNegativeInt,
    reputation: z.number(),
}).meta({ id: "Match" })

export const matchesResponseSchema = paginatedResponseSchema(matchResponseSchema).meta({ id: "Matches" })

export const suggestionResponseSchema = z.object({
    userId: nonEmptyString,
    username: z.string(),
    offerableStickers: z.array(
        z.object({
            number: positiveInt,
            title: z.string(),
        }),
    ),
}).meta({ id: "Suggestion" })

export const suggestionsResponseSchema = paginatedResponseSchema(suggestionResponseSchema).meta({ id: "Suggestions" })
