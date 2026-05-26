import { BadRequestError } from "../../../shared/errors/http-errors";
import { paginate } from "../../../shared/utils/query";
import { CollectionItem } from "../../collection/entities/collection-item.interface";
import { Sticker } from "../../stickers/entities/sticker.entity";
import type { User } from "../../users/entities/user.entity";
import userRepository from "../../users/repositories/user.repository";

export default class MatchingService {
    /**
     * GET /users/:userId/suggestions?page=1&limit=20
     * Obtiene sugerencias de usuarios para matching con paginación
     * Usa índices para búsqueda O(1) en lugar de iterar todos los usuarios
     */
    static async getSuggestionsByUser(
        userId: string,
        page: number = 1,
        limit: number = 20,
    ) {
        // Obtener el usuario actual
        const currentUser = await userRepository.findById(userId);
        if (!currentUser || !currentUser.collection) {
            return { data: [], page, limit, total: 0 };
        }

        const missingStickers = currentUser.collection.missingStickers;
        if (missingStickers.length === 0) {
            return { data: [], page, limit, total: 0 };
        }

        // Crear mapa rápido de stickers faltantes
        const missingStickersMap = new Map(
            missingStickers.map((s: Sticker) => [s.number, s]),
        );

        const repo = userRepository as typeof userRepository & {
            paginate?: (
                filter: Record<string, unknown>,
                options: { page: number; limit: number },
            ) => Promise<{
                data: User[];
                total: number;
                page: number;
                limit: number;
            }>;
        };

        if (repo.paginate) {
            const result = await repo.paginate(
                {
                    _id: { $ne: userId },
                    "collection.items.sticker.number": {
                        $in: missingStickers.map((s) => s.number),
                    },
                },
                { page, limit },
            );

            const suggestions = result.data
                .filter((user) => user.collection)
                .map((user) => {
                    const offerableStickers = user
                        .collection!.items.filter((item: CollectionItem) =>
                            missingStickersMap.has(item.sticker.number),
                        )
                        .map((item: CollectionItem) => ({
                            number: item.sticker.number,
                            title:
                                item.sticker.getDisplayName?.() ||
                                `Sticker #${item.sticker.number}`,
                        }));

                    return {
                        userId: user.id,
                        username: user.username,
                        offerableStickers,
                    };
                })
                .filter(
                    (suggestion) => suggestion.offerableStickers.length > 0,
                );

            return {
                data: suggestions,
                page: result.page,
                limit: result.limit,
                total: result.total,
            };
        }

        const allUsers = await userRepository.findAll();

        const allSuggestions: Array<{
            userId: string;
            username: string;
            offerableStickers: Array<{ number: number; title: string }>;
        }> = [];

        for (const user of allUsers) {
            if (user.id === userId || !user.collection) continue;

            const offerableStickers = user.collection.items
                .filter((item: CollectionItem) =>
                    missingStickersMap.has(item.sticker.number),
                )
                .map((item: CollectionItem) => ({
                    number: item.sticker.number,
                    title:
                        item.sticker.getDisplayName?.() ||
                        `Sticker #${item.sticker.number}`,
                }));

            if (offerableStickers.length > 0) {
                allSuggestions.push({
                    userId: user.id,
                    username: user.username,
                    offerableStickers,
                });
            }
        }

        const { data, total } = paginate(allSuggestions, page, limit);
        return { data, page, limit, total };
    }

    /**
     * GET /matches?stickerId=...&page=1&limit=20
     * Obtiene usuarios que tienen un sticker específico con paginación
     * Usa índices para O(1) lookup en lugar de iterar todos los usuarios
     */
    static async getMatches(
        stickerId: string,
        page: number = 1,
        limit: number = 20,
    ) {
        const stickerNum = parseInt(stickerId, 10);
        if (isNaN(stickerNum)) {
            throw new BadRequestError("stickerId debe ser un número válido");
        }

        const repo = userRepository as typeof userRepository & {
            paginate?: (
                filter: Record<string, unknown>,
                options: {
                    page: number;
                    limit: number;
                    sort?: Record<string, 1 | -1>;
                },
            ) => Promise<{
                data: User[];
                total: number;
                page: number;
                limit: number;
            }>;
        };

        if (repo.paginate) {
            const result = await repo.paginate(
                { "collection.items.sticker.number": stickerNum },
                { page, limit, sort: { reputation: -1 } },
            );

            const data = result.data.flatMap((user) => {
                if (!user.collection) return [];
                const item = user.collection.getItemByStickerId(stickerNum);
                if (!item || item.quantity <= 0) return [];
                return [
                    {
                        userId: user.id,
                        username: user.username,
                        email: user.email,
                        quantity: item.quantity,
                        reputation: user.reputation,
                    },
                ];
            });

            return {
                data,
                page: result.page,
                limit: result.limit,
                total: result.total,
            };
        }

        const allUsers = await userRepository.findAll();

        const allMatches: Array<{
            userId: string;
            username: string;
            email: string;
            quantity: number;
            reputation: number;
        }> = [];

        for (const user of allUsers) {
            if (!user.collection) continue;

            const item = user.collection.getItemByStickerId(stickerNum);
            if (item && item.quantity > 0) {
                allMatches.push({
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    quantity: item.quantity,
                    reputation: user.reputation,
                });
            }
        }

        allMatches.sort((a, b) => b.reputation - a.reputation);

        const { data, total } = paginate(allMatches, page, limit);
        return { data, page, limit, total };
    }
}
