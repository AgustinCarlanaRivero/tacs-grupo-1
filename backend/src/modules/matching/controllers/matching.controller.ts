import { Request, Response } from "express"
import type { z } from "zod"
import { paginationQuerySchema, userIdParamSchema } from "../../../shared/validation/common"
import { matchesQuerySchema } from "../schemas/matching.schemas"
import MatchingService from "../services/matching.service"

type UserParams = z.infer<typeof userIdParamSchema>
type PaginationQuery = z.infer<typeof paginationQuerySchema>
type MatchesQuery = z.infer<typeof matchesQuerySchema>

export default class MatchingController {
    // GET /users/:userId/suggestions?page=1&limit=20
    getSuggestionsByUser = async (req: Request, res: Response) => {
        const { userId } = req.params as UserParams
        const { page, limit } = req.query as unknown as PaginationQuery

        const suggestions = await MatchingService.getSuggestionsByUser(userId, page, limit)
        return res.status(200).json(suggestions)
    }

    // GET /matches?stickerId=...&page=1&limit=20
    getMatches = async (req: Request, res: Response) => {
        const { stickerId, page, limit } = req.query as unknown as MatchesQuery
        const matches = await MatchingService.getMatches(stickerId, page, limit)
        return res.status(200).json(matches)
    }
}
