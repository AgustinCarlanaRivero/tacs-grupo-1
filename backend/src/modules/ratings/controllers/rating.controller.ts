import { Request, Response } from "express"
import type { z } from "zod"
import { UnauthorizedError } from "../../../shared/errors/http-errors"
import { userIdParamSchema } from "../../../shared/validation/common"
import { ratingCreateRequestSchema } from "../schemas/rating.schemas"
import RatingService from "../services/rating.service"

type AuthenticatedRequest = Request & { user?: { id: string } }
type UserParams = z.infer<typeof userIdParamSchema>
type CreateRatingBody = z.infer<typeof ratingCreateRequestSchema>

function getAuthUserId(req: Request): string | undefined {
    return (req as AuthenticatedRequest).user?.id
}

export default class RatingController {
    // GET /users/:userId/ratings
    getRatingsByUser = async (req: Request, res: Response) => {
        const { userId } = req.params as UserParams
        const ratings = await RatingService.getRatingsByUser(userId)
        return res.status(200).json(ratings)
    }

    // POST /users/:userId/ratings
    createRating = async (req: Request, res: Response) => {
        const { userId: revieweeId } = req.params as UserParams
        const reviewerId = getAuthUserId(req)

        if (!reviewerId) {
            throw new UnauthorizedError()
        }

        const body = req.body as CreateRatingBody
        const newRating = await RatingService.createRating(revieweeId, reviewerId, body)
        return res.status(201).json(newRating)
    }
}
