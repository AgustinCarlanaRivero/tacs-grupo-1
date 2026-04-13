import { Request, Response } from "express";
import TradeService from "./trade.service.ts";
import AuctionService from "./auction.service.ts";
import PostService from "./post.service.ts";

export default class PostController {
    
    createPost = async (req: Request, res: Response) => {
        const { type, ...postData } = req.body; // type puede ser 'DIRECT_TRADE' o 'AUCTION'
        const userId = req.user.id; // Asumiendo que viene del middleware de Auth

        let newPost;

        // Delegamos al servicio correspondiente según el tipo
        if (type === 'DIRECT_TRADE') {
            newPost = await TradeService.createTrade(userId, postData);
        } else if (type === 'AUCTION') {
            newPost = await AuctionService.createAuction(userId, postData);
        } else {
            return res.status(400).json({ error: "Tipo de publicación inválido" });
        }

        return res.status(201).json(newPost);
    }

    getPostById = async (req: Request, res: Response) => {
        const { id } = req.params;
        // Para consultas generales, usamos el servicio base compartido
        const post = await PostService.getPostById(id);
        return res.status(200).json(post);
    }
}