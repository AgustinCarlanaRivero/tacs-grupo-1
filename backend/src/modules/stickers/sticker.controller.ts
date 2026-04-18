import { Request, Response } from "express"
import { AppError } from "../../shared/errors/app-error.ts"
import StickerService from "./sticker.service.ts"


export default class StickerController {
    getStickers = async (req: Request, res: Response) => {
        const { category, team, club } = req.query;
        
        const filters = {
            category: category as string | undefined,
            team: team as string | undefined,
            club: club as string | undefined
        };
        
        const stickers = await StickerService.getStickers(filters);
        return res.status(200).json(stickers);
    }

    getStickerById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const sticker = await StickerService.getStickerById(id);
        
        if (!sticker) {
            throw new AppError(404, `Sticker #${id} not found`);
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
