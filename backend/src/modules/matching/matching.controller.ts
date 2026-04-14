import { Request, Response } from "express"
import { AppError } from "../../shared/errors/app-error.ts"
import MatchingService from "./matching.service.ts"

function paramAsString(value: string | string[] | undefined): string {
    if (value === undefined) return ""
    return Array.isArray(value) ? (value[0] ?? "") : value
}

export default class MatchingController {
    // GET /users/:userId/suggestions
    getSuggestionsByUser = async (req: Request, res: Response) => {
        const userId = paramAsString(req.params.userId)
        const suggestions = await MatchingService.getSuggestionsByUser(userId)
        return res.status(200).json(suggestions)
    }

    // GET /matches?stickerId=...
    getMatches = async (req: Request, res: Response) => {
        const stickerId = req.query.stickerId
        if (typeof stickerId !== "string" || stickerId.trim() === "") {
            throw new AppError("stickerId es requerido", 400)
        }

        const matches = await MatchingService.getMatches(stickerId)
        return res.status(200).json(matches)
    }
}
