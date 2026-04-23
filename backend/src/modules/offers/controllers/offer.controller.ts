import { Request, Response } from "express"
import OfferService from "../services/offer.service"
import { AppError } from "../../../shared/errors/app-error"

type AuthenticatedRequest = Request & { user?: { id: string } }

function paramAsString(value: string | string[] | undefined): string {
    if (value === undefined) return ""
    return Array.isArray(value) ? (value[0] ?? "") : value
}

function getAuthUserId(req: Request): string | undefined {
    return (req as AuthenticatedRequest).user?.id
}

export default class OfferController {
    // GET /posts/:postId/offers
    getOffersByPost = async (req: Request, res: Response) => {
        const postId = paramAsString(req.params.postId)
        const offers = await OfferService.getOffersByPost(postId)
        return res.status(200).json(offers)
    }

    // POST /posts/:postId/offers
    createOffer = async (req: Request, res: Response) => {
        const postId = paramAsString(req.params.postId)
        const offererId = getAuthUserId(req)

        if (!offererId) {
            throw new AppError("No autenticado", 401)
        }

        const newOffer = await OfferService.createOffer(postId, offererId, req.body)
        return res.status(201).json(newOffer)
    }

    // PATCH /offers/:offerId/state
    updateOfferState = async (req: Request, res: Response) => {
        const offerId = paramAsString(req.params.offerId)
        const { state } = req.body as { state?: unknown }

        if (!state) {
            throw new AppError("El estado (state) es requerido", 400)
        }

        const updated = await OfferService.updateOfferState(offerId, state)
        return res.status(200).json(updated)
    }

    // DELETE /offers/:offerId
    deleteOffer = async (req: Request, res: Response) => {
        const offerId = paramAsString(req.params.offerId)
        const userId = getAuthUserId(req)

        if (!userId) {
            throw new AppError("No autenticado", 401)
        }

        await OfferService.deleteOffer(offerId, userId)
        return res.status(204).send()
    }
}
