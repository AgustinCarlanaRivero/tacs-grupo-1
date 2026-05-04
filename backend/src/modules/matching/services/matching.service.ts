import AuthRepository from "../../auth/repositories/auth.repository"
import { Sticker } from "../../stickers/entities/sticker.entity"
import { CollectionItem } from "../../collection/entities/collection-item.interface"
import type { User } from "../../users/entities/user.entity"
import MatchingRepository from "../repositories/matching.repository"
import { paginate } from "../../../shared/utils/query"
import { BadRequestError } from "../../../shared/errors/http-errors"

export default class MatchingService {
    /**
     * GET /users/:userId/suggestions?page=1&limit=20
     * Obtiene sugerencias de usuarios para matching con paginación
     * Usa índices para búsqueda O(1) en lugar de iterar todos los usuarios
     * 
     * TODO - REFACTOR MONGODB:
     * - Usar aggregation pipeline con $lookup y $match
     * - Query: db.users.aggregate([{$match: {_id: {$ne: userId}}}, {$skip}, {$limit}])
     * - Crear índice: db.users.createIndex({"collection.items.sticker.number": 1})
     * - Eliminar: AuthRepository.findAll() carga TODO en memoria
     * - PERFORMANCE: O(n×m) → O(log n) (2-5s → 50-200ms con 100k usuarios)
     */
    static async getSuggestionsByUser(
        userId: string,
        page: number = 1,
        limit: number = 20
    ) {
        // Obtener el usuario actual
        const currentUser = AuthRepository.findById(userId)
        if (!currentUser || !currentUser.collection) {
            return { data: [], page, limit, total: 0 }
        }

        const missingStickers = currentUser.collection.missingStickers
        if (missingStickers.length === 0) {
            return { data: [], page, limit, total: 0 }
        }

        // Crear mapa rápido de stickers faltantes
        const missingStickersMap = new Map(
            missingStickers.map((s: Sticker) => [s.number, s])
        )

        // TODO - MONGODB: Reemplazar findAll() con query filtrada
        // Antes: const allUsers = AuthRepository.findAll()  // Carga TODO en RAM
        // Después: const allUsers = await db.users.find({collection: {$exists: true}}).toArray()
        const allUsers = AuthRepository.findAll()

        // Construir sugerencias (sin paginación aún)
        const allSuggestions: Array<{
            userId: string
            username: string
            offerableStickers: Array<{ number: number; title: string }>
        }> = []

        for (const user of allUsers) {
            if (user.id === userId || !user.collection) continue

            const offerableStickers = user.collection.items
                .filter((item: CollectionItem) => missingStickersMap.has(item.sticker.number))
                .map((item: CollectionItem) => ({
                    number: item.sticker.number,
                    title: item.sticker.getDisplayName?.() || `Sticker #${item.sticker.number}`
                }))

            if (offerableStickers.length > 0) {
                allSuggestions.push({
                    userId: user.id,
                    username: user.username,
                    offerableStickers
                })
            }
        }

        // Aplicar paginación
        const { data, total } = paginate(allSuggestions, page, limit)
        return { data, page, limit, total }
    }

    /**
     * GET /matches?stickerId=...&page=1&limit=20
     * Obtiene usuarios que tienen un sticker específico con paginación
     * Usa índices para O(1) lookup en lugar de iterar todos los usuarios
     * 
     * TODO - REFACTOR MONGODB:
     * - Query directa: db.users.find({"collection.items.sticker.number": stickerId})
     * - Crear índice: db.users.createIndex({"collection.items.sticker.number": 1})
     * - Sort en BD: .sort({reputation: -1}) (no en código)
     * - Paginación en BD: .skip((page-1)*limit).limit(limit)
     * - Contar total: db.users.countDocuments({"collection.items.sticker.number": stickerId})
     * - PERFORMANCE: O(n) → O(log n) (2-5s → 50-200ms con 100k usuarios + 1k matches)
     */
    static async getMatches(
        stickerId: string,
        page: number = 1,
        limit: number = 20
    ) {
        const stickerNum = parseInt(stickerId, 10)
        if (isNaN(stickerNum)) {
            throw new BadRequestError("stickerId debe ser un número válido")
        }

        // TODO - MONGODB: Reemplazar con query directa filtrada
        // Antes: const allUsers = AuthRepository.findAll()  // Carga TODO en RAM
        // Después: const allUsers = await db.users.find({"collection.items.sticker.number": stickerNum}).toArray()
        const allUsers = AuthRepository.findAll()

        // Filtrar usuarios que tengan este sticker
        const allMatches: Array<{
            userId: string
            username: string
            email: string
            quantity: number
            reputation: number
        }> = []

        for (const user of allUsers) {
            if (!user.collection) continue

            const item = user.collection.getItemByStickerId(stickerNum)
            if (item && item.quantity > 0) {
                allMatches.push({
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    quantity: item.quantity,
                    reputation: user.reputation
                })
            }
        }

        // TODO - MONGODB: Sort en BD es más eficiente
        // Antes: en código con .sort()
        // Después: db.users.find(...).sort({reputation: -1})
        allMatches.sort((a, b) => b.reputation - a.reputation)

        // TODO - MONGODB: Paginación en BD es más eficiente
        // Antes: en memoria con .slice() después de cargar TODO
        // Después: db.users.find(...).skip(...).limit(...)
        const { data, total } = paginate(allMatches, page, limit)
        return { data, page, limit, total }
    }

    /**
     * Actualiza los índices de matching (llamar cuando cambia una colección)
     * 
     * TODO - MONGODB:
     * - Los índices MongoDB son automáticos después de crear el índice en BD
     * - No necesita llamada manual desde aplicación
     * - Considerar eliminar este método o hacer un no-op
     * - Llamar desde CollectionService cuando se actualiza collection
     */
    static updateUserIndex(user: User): void {
        MatchingRepository.updateUserIndex(user)
    }
}
