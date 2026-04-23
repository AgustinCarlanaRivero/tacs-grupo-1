import { Request, Response } from "express"
import { AppError } from "../../shared/errors/app-error" // Para manejar errores si el sticker no existe, por ej.
import CollectionService from "./collection.service"

export default class CollectionController {
    
    // GET /users/:userId/collection
    getCollection = async (req: Request, res: Response) => {
        const { userId } = req.params
        const collection = await CollectionService.getCollection(userId)
        return res.status(200).json(collection)
    }

    // POST /users/:userId/collection/items
    addCollectionItem = async (req: Request, res: Response) => {
        const { userId } = req.params
        const itemData = req.body // Ej: { stickerId: 10, quantity: 1 }
        
        const newItem = await CollectionService.addCollectionItem(userId, itemData)
        // Usamos 201 Created porque estamos creando un recurso nuevo
        return res.status(201).json(newItem)
    }

    // PATCH /users/:userId/collection/items/:stickerId
    updateCollectionItemQuantity = async (req: Request, res: Response) => {
        const { userId, stickerId } = req.params
        const { quantity } = req.body
        
        const updatedItem = await CollectionService.updateCollectionItemQuantity(userId, stickerId, quantity)
        return res.status(200).json(updatedItem)
    }

    // DELETE /users/:userId/collection/items/:stickerId
    removeCollectionItem = async (req: Request, res: Response) => {
        const { userId, stickerId } = req.params
        
        await CollectionService.removeCollectionItem(userId, stickerId)
        return res.status(204).send()
    }

    // POST /users/:userId/collection/missing
    addMissingSticker = async (req: Request, res: Response) => {
        const { userId } = req.params
        const { stickerId } = req.body
        
        const missingSticker = await CollectionService.addMissingSticker(userId, stickerId)
        return res.status(201).json(missingSticker)
    }

    // DELETE /users/:userId/collection/missing/:stickerId
    removeMissingSticker = async (req: Request, res: Response) => {
        const { userId, stickerId } = req.params
        
        await CollectionService.removeMissingSticker(userId, stickerId)
        return res.status(204).send()
    }
}