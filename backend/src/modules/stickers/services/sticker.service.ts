import stickerRepository from "../repositories/sticker.repository"
import { NotFoundError } from "../../../shared/errors/http-errors"
import { getStickerSearchValues, matchesAnyQuery, normalizeQuery } from "../../../shared/utils/query"

export default class StickerService {
    /**
     * Obtiene todos los stickers con filtros opcionales
     * @param filters - { state?: string, type?: string, team?: string, club?: string }
     */
    static async getStickers(
        filters?: { state?: string; type?: string; team?: string; club?: string; query?: string },
    ) {
        const query = normalizeQuery(filters?.query)
        const baseFilters = {
            state: filters?.state,
            type: filters?.type,
            team: filters?.team,
            club: filters?.club,
        }
        const hasBaseFilters = Object.values(baseFilters).some(value => value !== undefined)
        const stickers = hasBaseFilters
            ? await stickerRepository.findByFilters(baseFilters)
            : await stickerRepository.findAll()

        if (!query) return stickers

        return stickers.filter(sticker => matchesAnyQuery(getStickerSearchValues(sticker as any), query))
    }

    /**
     * Obtiene un sticker por su número
     */
    static async getStickerById(stickerId: string) {
        const id = parseInt(stickerId, 10)
        return await stickerRepository.findById(id)
    }

    /**
     * Obtiene un sticker con validación, lanza error si no existe
     */
    static async getStickerByIdOrFail(stickerId: string) {
        const sticker = await this.getStickerById(stickerId)
        if (!sticker) {
            throw new NotFoundError(`Sticker #${stickerId} not found`)
        }
        return sticker
    }

    /**
     * Obtiene todos los jugadores únicos
     */
    static async getPlayers() {
        return await stickerRepository.getPlayers()
    }

    /**
     * Obtiene todos los equipos únicos
     */
    static async getTeams() {
        return await stickerRepository.getTeams()
    }

    /**
     * Obtiene todos los clubes únicos
     */
    static async getClubs() {
        return await stickerRepository.getClubs()
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
