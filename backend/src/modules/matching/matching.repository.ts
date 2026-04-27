import { Sticker } from "../stickers/sticker.entity.ts"
import { User } from "../users/entities/user.entity.ts"

/**
 * Repository con índices secundarios para búsquedas eficientes en matching
 * Evita iterar sobre todos los usuarios en cada búsqueda
 * 
 * TODO - REFACTOR MONGODB:
 * - Reemplazar Maps con queries directo a MongoDB
 * - Eliminar: stickerIndex y userMissingIndex (no necesarios con índices en BD)
 * - Crear índices en BD: 
 *   * db.users.createIndex({"collection.items.sticker.number": 1})
 *   * db.users.createIndex({"collection.missingStickers.number": 1})
 *   * db.users.createIndex({"reputation": -1})
 * - Métodos async con queries MongoDB
 * 
 * PERFORMANCE:
 * - Actual: O(1) lookups en Maps pero carga toda la data en RAM
 * - MongoDB: O(log n) lookups con índices, sin limitación de memoria
 */
class MatchingRepository {
    // stickerIndex: stickerId -> Set<userId> (qué usuarios tienen cada sticker)
    private stickerIndex: Map<number, Set<string>> = new Map()
    
    // userMissingIndex: userId -> Set<stickerId> (stickers faltantes de cada usuario)
    private userMissingIndex: Map<string, Set<number>> = new Map()

    /**
     * Actualiza los índices cuando cambia la colección de un usuario
     * Complejidad: O(n) donde n es cantidad de items en la colección
     * 
     * TODO - MONGODB:
     * - Con MongoDB, no es necesaria esta lógica manual
     * - Los índices se mantienen automáticamente
     * - Considerar hacer este método un no-op o eliminarlo
     */
    updateUserIndex(user: User): void {
        if (!user.collection) return

        const userHas = new Set<number>()
        
        // Indexar stickers que posee
        for (const item of user.collection.items) {
            userHas.add(item.sticker.number)
            if (!this.stickerIndex.has(item.sticker.number)) {
                this.stickerIndex.set(item.sticker.number, new Set())
            }
            this.stickerIndex.get(item.sticker.number)!.add(user.id)
        }

        // Indexar stickers faltantes
        const userMissing = new Set(user.collection.missingStickers.map((s: Sticker) => s.number))
        this.userMissingIndex.set(user.id, userMissing)

        // Limpiar: remover usuario de stickers que ya no posee
        for (const [stickerId, userIdSet] of this.stickerIndex.entries()) {
            if (!userHas.has(stickerId) && userIdSet.has(user.id)) {
                userIdSet.delete(user.id)
                // Eliminar entrada si nadie lo tiene
                if (userIdSet.size === 0) {
                    this.stickerIndex.delete(stickerId)
                }
            }
        }
    }

    /**
     * Obtiene IDs de usuarios que tienen un sticker específico
     * Complejidad: O(1) lookup + O(k) para retornar k resultados
     */
    getUsersBySticker(stickerId: number): string[] {
        return Array.from(this.stickerIndex.get(stickerId) ?? new Set())
    }

    /**
     * Obtiene stickers faltantes de un usuario
     * Complejidad: O(1) lookup
     */
    getUserMissingStickers(userId: string): Set<number> {
        return this.userMissingIndex.get(userId) ?? new Set()
    }

    /**
     * Reinicia los índices (cuando se carga data fresca)
     */
    clear(): void {
        this.stickerIndex.clear()
        this.userMissingIndex.clear()
    }

    /**
     * Estadísticas de índices (para debugging)
     */
    getStats(): { totalIndexedStickers: number; totalIndexedUsers: number } {
        return {
            totalIndexedStickers: this.stickerIndex.size,
            totalIndexedUsers: this.userMissingIndex.size
        }
    }
}

export default new MatchingRepository()
