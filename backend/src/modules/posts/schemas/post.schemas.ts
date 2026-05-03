import { z } from "zod"
import { PostType } from "../enums/post-type.enum"
import { PostState } from "../enums/post-state.enum"
import { stickerResponseSchema } from "../../stickers/sticker.schemas"
import { collectionItemAddRequestSchema, collectionItemResponseSchema } from "../../collection/collection.schemas"
import { isoDateTime, nonEmptyString, positiveInt } from "../../../shared/validation/common"

export const postTypeEnum = z.enum([PostType.DIRECT_TRADE, PostType.AUCTION])
export const postStateEnum = z.enum([PostState.ACTIVE, PostState.COMPLETED, PostState.CLOSED])

/** GET /users/:userId/posts?type=&state= */
export const postFilterQuerySchema = z.object({
    type: postTypeEnum.optional(),
    state: postStateEnum.optional(),
})

/**
 * POST /users/:userId/posts.
 * Si el `type` es AUCTION, se requieren `endsAt` y opcionalmente
 * `minimumRequirements`. Para DIRECT_TRADE esos campos no aplican.
 */
export const postCreateRequestSchema = z
    .object({
        type: postTypeEnum,
        stickerId: positiveInt,
        endsAt: isoDateTime.optional(),
        minimumRequirements: z.array(collectionItemAddRequestSchema).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.type === PostType.AUCTION && !data.endsAt) {
            ctx.addIssue({
                code: "custom",
                path: ["endsAt"],
                message: "endsAt es requerido para subastas",
            })
        }
    })
    .meta({ id: "PostCreateRequest" })

/** PATCH /users/:userId/posts/:postId/state */
export const postStateUpdateRequestSchema = z.object({
    state: postStateEnum,
}).meta({ id: "PostStateUpdateRequest" })

export const postResponseSchema = z.object({
    id: nonEmptyString,
    type: postTypeEnum,
    state: postStateEnum,
    sticker: stickerResponseSchema,
    owner: z.object({
        id: nonEmptyString,
        username: z.string(),
    }),
    createdAt: isoDateTime.optional(),
    endsAt: isoDateTime.optional(),
    minimumRequirements: z.array(collectionItemResponseSchema).optional(),
}).meta({ id: "Post" })
