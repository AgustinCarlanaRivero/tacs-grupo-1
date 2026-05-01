import { StickerRepository } from "./sticker.repository"

export default class StickerService {
    /**
     * Obtiene todos los stickers con filtros opcionales
     * @param filters - { state?: string, type?: string, team?: string, club?: string }
     */
    static async getStickers(filters?: { state?: string; type?: string; team?: string; club?: string }) {
        if (filters && Object.keys(filters).length > 0) {
            return await StickerRepository.findByFilters(filters)
        }
        return await StickerRepository.findAll()
    }

    /**
     * Obtiene un sticker por su número
     */
    static async getStickerById(stickerId: string) {
        const id = parseInt(stickerId, 10)
        return await StickerRepository.findById(id)
    }

    /**
     * Obtiene un sticker con validación, lanza error si no existe
     */
    static async getStickerByIdOrFail(stickerId: string) {
        const sticker = await this.getStickerById(stickerId)
        if (!sticker) {
            throw new Error(`Sticker #${stickerId} not found`)
        }
        return sticker
    }

    /**
     * Obtiene todos los jugadores únicos
     */
    static async getPlayers() {
        return await StickerRepository.getPlayers()
    }

    /**
     * Obtiene todos los equipos únicos
     */
    static async getTeams() {
        return await StickerRepository.getTeams()
    }

    /**
     * Obtiene todos los clubes únicos
     */
    static async getClubs() {
        return await StickerRepository.getClubs()
    }

    /**
     * Obtiene todos los estados válidos de stickers
     */
    static getValidStates(): string[] {
        return ["NEW", "DAMAGED"]
    }

    /**
     * Obtiene todos los tipos válidos de stickers
     */
    static getValidTypes(): string[] {
        return ["REGULAR", "SHINY"]
    }
}
