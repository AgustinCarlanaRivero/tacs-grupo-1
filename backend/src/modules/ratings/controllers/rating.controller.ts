import { Request, Response } from "express"
import { AppError } from "../../../shared/errors/app-error.ts"
import RatingService from "../services/rating.service.ts"

type AuthenticatedRequest = Request & { user?: { id: string } }

function paramAsString(value: string | string[] | undefined): string {
    if (value === undefined) return ""
    return Array.isArray(value) ? (value[0] ?? "") : value
}

function getAuthUserId(req: Request): string | undefined {
    return (req as AuthenticatedRequest).user?.id
}

export default class RatingController {
    // GET /users/:userId/ratings
    getRatingsByUser = async (req: Request, res: Response) => {
        const userId = paramAsString(req.params.userId)
        const ratings = await RatingService.getRatingsByUser(userId)
        return res.status(200).json(ratings)
    }

    // POST /users/:userId/ratings
    createRating = async (req: Request, res: Response) => {
        const revieweeId = paramAsString(req.params.userId)
        const reviewerId = getAuthUserId(req)

        if (!reviewerId) {
            throw new AppError("No autenticado", 401)
        }

        const newRating = await RatingService.createRating(revieweeId, reviewerId, req.body)
        return res.status(201).json(newRating)
    }
}
