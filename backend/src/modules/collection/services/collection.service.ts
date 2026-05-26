import type { z } from "zod";
import {
    BadRequestError,
    NotFoundError,
} from "../../../shared/errors/http-errors";
import StickerService from "../../stickers/services/sticker.service";
import { CollectionItem } from "../entities/collection-item.interface";
import { Collection } from "../entities/collection.entity";
import collectionRepository from "../repositories/collection.repository";
import {
    collectionItemAddRequestSchema,
    missingStickerAddRequestSchema,
} from "../schemas/collection.schemas";

type AddCollectionItemData = z.infer<typeof collectionItemAddRequestSchema>;
type AddMissingStickerData = z.infer<typeof missingStickerAddRequestSchema>;

const buildCollectionSticker = (
    sticker: AddCollectionItemData["sticker"]
): CollectionItem["sticker"] =>
    ({
        number: sticker.number,
        player: {
            ...sticker.player,
            image: sticker.player.image ?? "",
        },
        state: "NEW",
        type: sticker.type,
        description: "",
    } as CollectionItem["sticker"]);

export default class CollectionService {
    /**
     * GET /users/:userId/collection
     * Obtiene toda la coleccion del usuario
     */
    static async getCollection(userId: string) {
        const collection = await collectionRepository.getCollection(userId);
        return collection || new Collection();
    }

    /**
     * POST /users/:userId/collection/items
     * Agregar una figurita obtenida
     */
    static async addCollectionItem(
        userId: string,
        itemData: AddCollectionItemData
    ) {
        const { sticker, quantity = 1 } = itemData;

        const newItem: CollectionItem = {
            sticker: buildCollectionSticker(sticker),
            quantity,
        };

        const collection = await collectionRepository.addCollectionItem(
            userId,
            newItem
        );
        if (!collection) {
            throw new NotFoundError(`User ${userId} not found`);
        }

        return newItem;
    }

    /**
     * PATCH /users/:userId/collection/items/:stickerId
     * Actualiza la cantidad de un item
     */
    static async updateCollectionItemQuantity(
        userId: string,
        stickerId: string,
        quantity: number
    ) {
        if (quantity < 0) {
            throw new BadRequestError("Quantity cannot be negative");
        }

        const id = parseInt(stickerId, 10);
        // Validar que el sticker exista
        await StickerService.getStickerByNumberOrFail(stickerId);

        const collection =
            await collectionRepository.updateCollectionItemQuantity(
                userId,
                id,
                quantity
            );
        if (!collection) {
            throw new NotFoundError(
                `User ${userId} not found or collection not initialized`
            );
        }

        return { stickerId: id, quantity };
    }

    /**
     * DELETE /users/:userId/collection/items/:stickerId
     * Elimina el item de la coleccion
     */
    static async removeCollectionItem(userId: string, stickerId: string) {
        const id = parseInt(stickerId, 10);
        // Validar que el sticker exista
        await StickerService.getStickerByNumberOrFail(stickerId);

        const collection = await collectionRepository.removeCollectionItem(
            userId,
            id
        );
        if (!collection) {
            throw new NotFoundError(
                `User ${userId} not found or collection not initialized`
            );
        }
    }

    /**
     * POST /users/:userId/collection/missing
     * Agregar un Sticker a la lista de faltantes
     */
    static async addMissingSticker(
        userId: string,
        itemData: AddMissingStickerData
    ) {
        const sticker = buildCollectionSticker(itemData.sticker);

        const collection = await collectionRepository.addMissingSticker(
            userId,
            sticker
        );
        if (!collection) {
            throw new NotFoundError(`User ${userId} not found`);
        }

        return sticker;
    }

    /**
     * DELETE /users/:userId/collection/missing/:stickerId
     * Eliminar de la lista de faltantes
     */
    static async removeMissingSticker(userId: string, stickerId: string) {
        const id = parseInt(stickerId, 10);
        // Validar que el sticker exista
        await StickerService.getStickerByNumberOrFail(stickerId);

        const collection = await collectionRepository.removeMissingSticker(
            userId,
            id
        );
        if (!collection) {
            throw new NotFoundError(
                `User ${userId} not found or collection not initialized`
            );
        }
    }
}
