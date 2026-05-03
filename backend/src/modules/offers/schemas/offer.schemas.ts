import { z } from "zod"
import { OfferState } from "../enums/offer-state.enum"
import { collectionItemAddRequestSchema, collectionItemResponseSchema } from "../../collection/collection.schemas"
import { isoDateTime, nonEmptyString } from "../../../shared/validation/common"

export const offerStateEnum = z.enum([
    OfferState.PENDING,
    OfferState.APPROVED,
    OfferState.REJECTED,
    OfferState.CANCELLED,
])

/** GET /users/:userId/offers?role=sent|received|all */
export const offerRoleQuerySchema = z.object({
    role: z.enum(["sent", "received", "all"]).default("all"),
})

/** POST /users/:userId/posts/:postId/offers */
export const offerCreateRequestSchema = z.object({
    offered: z.array(collectionItemAddRequestSchema).min(1, "Debe ofrecer al menos una figurita"),
}).meta({ id: "OfferCreateRequest" })

/**
 * PATCH /users/:userId/posts/:postId/offers/:offerId/state.
 * El estado debe ser uno de los terminales (PENDING no se puede setear vía API).
 * El service además valida la transición real desde el estado actual.
 */
export const offerStateUpdateRequestSchema = z.object({
    state: z.enum([OfferState.APPROVED, OfferState.REJECTED, OfferState.CANCELLED]),
}).meta({ id: "OfferStateUpdateRequest" })

export const offerResponseSchema = z.object({
    id: nonEmptyString,
    state: offerStateEnum,
    createdAt: isoDateTime,
    offerer: z.object({
        id: nonEmptyString,
        username: z.string(),
    }),
    offered: z.array(collectionItemResponseSchema),
}).meta({ id: "Offer" })
