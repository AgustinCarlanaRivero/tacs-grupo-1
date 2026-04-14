import { Request, Response } from "express"
import { AppError } from "../../shared/errors/app-error.ts"
import StickerService from "./sticker.service.ts"


export default class StickerController {
    getStickers = async (req: Request, res: Response) => {
        const stickers = await StickerService.getStickers()
        return res.status(200).json(stickers)
    }

    getStickerById = async (req: Request, res: Response) => {
        const sticker = await StickerService.getStickerById()
        return res.status(200).json(sticker)
    }

}
