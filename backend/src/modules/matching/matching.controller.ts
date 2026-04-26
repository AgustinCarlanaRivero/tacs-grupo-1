import { Request, Response } from "express"
import { AppError } from "../../shared/errors/app-error.ts"
import MatchingService from "./matching.service.ts"

function paramAsString(value: string | string[] | undefined): string {
    if (value === undefined) return ""
    return Array.isArray(value) ? (value[0] ?? "") : value
}

function getPageParams(req: Request): { page: number; limit: number } {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    return { page, limit }
}

export default class MatchingController {
    // GET /users/:userId/suggestions?page=1&limit=20
    getSuggestionsByUser = async (req: Request, res: Response) => {
        const userId = paramAsString(req.params.userId)
        const { page, limit } = getPageParams(req)
        
        const suggestions = await MatchingService.getSuggestionsByUser(userId, page, limit)
        return res.status(200).json(suggestions)
    }

    // GET /matches?stickerId=...&page=1&limit=20
    getMatches = async (req: Request, res: Response) => {
        const stickerId = req.query.stickerId
        if (typeof stickerId !== "string" || stickerId.trim() === "") {
            throw new AppError("stickerId es requerido", 400)
        }

        const { page, limit } = getPageParams(req)
        const matches = await MatchingService.getMatches(stickerId, page, limit)
        return res.status(200).json(matches)
    }
}
