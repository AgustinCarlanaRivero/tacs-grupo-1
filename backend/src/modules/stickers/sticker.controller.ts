import { Request, Response } from "express"
import type { z } from "zod"
import { NotFoundError } from "../../shared/errors/http-errors"
import { stickerNumericIdParamSchema } from "../../shared/validation/common"
import { stickerFilterQuerySchema } from "./sticker.schemas"
import StickerService from "./sticker.service"

type StickerFilterQuery = z.infer<typeof stickerFilterQuerySchema>
type StickerIdParams = z.infer<typeof stickerNumericIdParamSchema>

export default class StickerController {
    getStickers = async (req: Request, res: Response) => {
        const filters = req.query as unknown as StickerFilterQuery
        const stickers = await StickerService.getStickers(filters)
        return res.status(200).json(stickers)
    }

    getStickerById = async (req: Request, res: Response) => {
        const { id } = req.params as StickerIdParams
        const sticker = await StickerService.getStickerById(id)

        if (!sticker) {
            throw new NotFoundError(`Sticker #${id} not found`)
        }

        return res.status(200).json(sticker)
    }

    getPlayers = async (_req: Request, res: Response) => {
        const players = await StickerService.getPlayers()
        return res.status(200).json(players)
    }

    getTeams = async (_req: Request, res: Response) => {
        const teams = await StickerService.getTeams()
        return res.status(200).json(teams)
    }

    getClubs = async (_req: Request, res: Response) => {
        const clubs = await StickerService.getClubs()
        return res.status(200).json(clubs)
    }
}
