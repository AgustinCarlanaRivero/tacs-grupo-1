import { z } from "zod";
import {
    nonEmptyString,
    paginatedResponseSchema,
    paginationQuerySchema,
    queryString,
} from "../../../shared/validation/common";
import {
    collectionItemAddRequestSchema,
    collectionItemResponseSchema,
} from "../../collection/schemas/collection.schemas";
import { OfferState } from "../enums/offer-state.enum";

export const offerStateEnum = z.enum([
    OfferState.PENDING,
    OfferState.APPROVED,
    OfferState.REJECTED,
    OfferState.CANCELLED,
]);

const offerRoleEnum = z.enum(["sent", "received", "all"]);

/** GET /users/:userId/offers?role=&query=&page=&limit= */
export const offerUserQuerySchema = paginationQuerySchema.extend({
    role: offerRoleEnum.default("all"),
    query: queryString,
});

/** GET /users/:userId/posts/:postId/offers?query=&page=&limit= */
export const offerPostQuerySchema = paginationQuerySchema.extend({
    query: queryString,
});

/** POST /users/:userId/posts/:postId/offers */
export const offerCreateRequestSchema = z
    .object({
        offered: z
            .array(collectionItemAddRequestSchema)
            .min(1, "Debe ofrecer al menos una figurita"),
    })
    .meta({ id: "OfferCreateRequest" });

/**
 * PATCH /users/:userId/posts/:postId/offers/:offerId/state.
 * El estado debe ser uno de los terminales (PENDING no se puede setear vía API).
 * El service además valida la transición real desde el estado actual.
 */
export const offerStateUpdateRequestSchema = z
    .object({
        state: z.enum([
            OfferState.APPROVED,
            OfferState.REJECTED,
            OfferState.CANCELLED,
        ]),
    })
    .meta({ id: "OfferStateUpdateRequest" });

export const offerResponseSchema = z
    .object({
        id: nonEmptyString,
        state: offerStateEnum,
        createdAt: z.date(),
        offerer: z.object({
            id: nonEmptyString,
            username: z.string(),
        }),
        offered: z.array(collectionItemResponseSchema),
        postId: nonEmptyString,
        postOwnerId: nonEmptyString,
    })
    .meta({ id: "Offer" });

export const offersResponseSchema = paginatedResponseSchema(
    offerResponseSchema,
).meta({ id: "Offers" });
