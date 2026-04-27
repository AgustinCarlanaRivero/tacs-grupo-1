import { Request, Response } from "express"
import OfferService, { OfferRole } from "../services/offer.service"
import { AppError } from "../../../shared/errors/app-error"

type AuthenticatedRequest = Request & { user?: { id: string } }

function paramAsString(value: string | string[] | undefined): string {
    if (value === undefined) return ""
    return Array.isArray(value) ? (value[0] ?? "") : value
}

function queryAsString(value: unknown): string {
    if (typeof value === "string") return value

    if (Array.isArray(value) && typeof value[0] === "string") {
        return value[0]
    }

    return ""
}

function getAuthUserId(req: Request): string | undefined {
    return (req as AuthenticatedRequest).user?.id
}

const OFFER_ROLES: OfferRole[] = ["sent", "received", "all"]

export default class OfferController {
    // GET /users/:userId/offers?role=sent|received|all
    getOffersByUser = async (req: Request, res: Response) => {
        const userId = paramAsString(req.params.userId)
        const role = (queryAsString(req.query.role) || "all") as OfferRole

        if (!OFFER_ROLES.includes(role)) {
            throw new AppError("El query param role debe ser sent, received o all", 400)
        }

        const offers = await OfferService.getOffersByUser(userId, role)
        return res.status(200).json(offers)
    }

    // GET /users/:userId/posts/:postId/offers
    getOffersByPost = async (req: Request, res: Response) => {
        const postOwnerId = paramAsString(req.params.userId)
        const postId = paramAsString(req.params.postId)
        const offers = await OfferService.getOffersByPost(postOwnerId, postId)
        return res.status(200).json(offers)
    }

    // POST /users/:userId/posts/:postId/offers
    createOffer = async (req: Request, res: Response) => {
        const postOwnerId = paramAsString(req.params.userId)
        const postId = paramAsString(req.params.postId)
        const offererId = getAuthUserId(req)

        if (!offererId) {
            throw new AppError("No autenticado", 401)
        }

        const newOffer = await OfferService.createOffer(postOwnerId, postId, offererId, req.body)
        return res.status(201).json(newOffer)
    }

    // PATCH /users/:userId/posts/:postId/offers/:offerId/state
    updateOfferState = async (req: Request, res: Response) => {
        const postOwnerId = paramAsString(req.params.userId)
        const postId = paramAsString(req.params.postId)
        const offerId = paramAsString(req.params.offerId)
        const actorId = getAuthUserId(req)
        const { state } = req.body as { state?: unknown }

        if (!actorId) {
            throw new AppError("No autenticado", 401)
        }

        if (!state) {
            throw new AppError("El estado (state) es requerido", 400)
        }

        const updated = await OfferService.updateOfferState(postOwnerId, postId, offerId, state, actorId)
        return res.status(200).json(updated)
    }
}
