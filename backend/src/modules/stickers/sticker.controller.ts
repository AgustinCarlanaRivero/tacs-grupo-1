import { Request, Response } from "express"
import { AppError } from "../../shared/errors/app-error"
import StickerService from "./sticker.service"
import { StickerTag } from "./category.enum"


export default class StickerController {
    getStickers = async (req: Request, res: Response) => {
        const { tags, team, club } = req.query;
        
        const filters = {
            tags: tags ? (Array.isArray(tags) ? tags as StickerTag[] : [tags as StickerTag]) : undefined,
            team: team as string | undefined,
            club: club as string | undefined
        };
        
        const stickers = await StickerService.getStickers(filters);
        return res.status(200).json(stickers);
    }

    getStickerById = async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const sticker = await StickerService.getStickerById(id);
        
        if (!sticker) {
            throw new AppError(`Sticker #${id} not found`, 404);
        }
        
        return res.status(200).json(sticker);
    }

    getPlayers = async (req: Request, res: Response) => {
        const players = await StickerService.getPlayers();
        return res.status(200).json(players);
    }

    getTeams = async (req: Request, res: Response) => {
        const teams = await StickerService.getTeams();
        return res.status(200).json(teams);
    }

    getClubs = async (req: Request, res: Response) => {
        const clubs = await StickerService.getClubs();
        return res.status(200).json(clubs);
    }

}
