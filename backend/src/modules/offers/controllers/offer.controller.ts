import { Request, Response } from "express"
import type { z } from "zod"
import OfferService from "../services/offer.service"
import { UnauthorizedError } from "../../../shared/errors/http-errors"
import {
    userIdParamSchema,
    userPostOfferParamsSchema,
    userPostParamsSchema,
} from "../../../shared/validation/common"
import {
    offerCreateRequestSchema,
    offerRoleQuerySchema,
    offerStateUpdateRequestSchema,
} from "../schemas/offer.schemas"

type AuthenticatedRequest = Request & { user?: { id: string } }
type UserParams = z.infer<typeof userIdParamSchema>
type UserPostParams = z.infer<typeof userPostParamsSchema>
type UserPostOfferParams = z.infer<typeof userPostOfferParamsSchema>
type OfferRoleQuery = z.infer<typeof offerRoleQuerySchema>
type CreateOfferBody = z.infer<typeof offerCreateRequestSchema>
type UpdateStateBody = z.infer<typeof offerStateUpdateRequestSchema>

function getAuthUserId(req: Request): string | undefined {
    return (req as AuthenticatedRequest).user?.id
}

export default class OfferController {
    // GET /users/:userId/offers?role=sent|received|all
    getOffersByUser = async (req: Request, res: Response) => {
        const { userId } = req.params as UserParams
        const { role } = req.query as unknown as OfferRoleQuery

        const offers = await OfferService.getOffersByUser(userId, role)
        return res.status(200).json(offers)
    }

    // GET /users/:userId/posts/:postId/offers
    getOffersByPost = async (req: Request, res: Response) => {
        const { userId: postOwnerId, postId } = req.params as UserPostParams
        const offers = await OfferService.getOffersByPost(postOwnerId, postId)
        return res.status(200).json(offers)
    }

    // POST /users/:userId/posts/:postId/offers
    createOffer = async (req: Request, res: Response) => {
        const { userId: postOwnerId, postId } = req.params as UserPostParams
        const offererId = getAuthUserId(req)

        if (!offererId) {
            throw new UnauthorizedError()
        }

        const body = req.body as CreateOfferBody
        const newOffer = await OfferService.createOffer(postOwnerId, postId, offererId, body)
        return res.status(201).json(newOffer)
    }

    // PATCH /users/:userId/posts/:postId/offers/:offerId/state
    updateOfferState = async (req: Request, res: Response) => {
        const { userId: postOwnerId, postId, offerId } = req.params as UserPostOfferParams
        const actorId = getAuthUserId(req)
        const { state } = req.body as UpdateStateBody

        if (!actorId) {
            throw new UnauthorizedError()
        }

        const updated = await OfferService.updateOfferState(postOwnerId, postId, offerId, state, actorId)
        return res.status(200).json(updated)
    }
}
