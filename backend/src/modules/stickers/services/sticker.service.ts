import { NotFoundError } from "../../../shared/errors/http-errors";
import { normalizeQuery } from "../../../shared/utils/query";
import userRepository from "../../users/repositories/user.repository";

export default class StickerService {
    /**
     * Obtiene todos los stickers con filtros opcionales
     * @param filters - { state?: string, type?: string, team?: string, club?: string }
     */
    static async getStickers(filters?: {
        state?: string;
        type?: string;
        team?: string;
        club?: string;
        query?: string;
    }) {
        const query = normalizeQuery(filters?.query);
        return await userRepository.findStickersByFilters({
            state: filters?.state,
            type: filters?.type,
            team: filters?.team,
            club: filters?.club,
            query,
        });
    }

    /**
     * Obtiene un sticker por su número
     */
    static async getStickerByNumber(stickerNumber: string) {
        const number = parseInt(stickerNumber, 10);
        if (Number.isNaN(number)) return null;

        return await userRepository.findStickerByNumber(number);
    }

    /**
     * Obtiene un sticker con validación, lanza error si no existe
     */
    static async getStickerByNumberOrFail(stickerNumber: string) {
        const sticker = await this.getStickerByNumber(stickerNumber);
        if (!sticker) {
            throw new NotFoundError(`Sticker #${stickerNumber} not found`);
        }
        return sticker;
    }

    /**
     * Obtiene todos los jugadores únicos
     */
    static async getPlayers() {
        return await userRepository.getStickerPlayers();
    }

    /**
     * Obtiene todos los equipos únicos
     */
    static async getTeams() {
        return await userRepository.getStickerTeams();
    }

    /**
     * Obtiene todos los clubes únicos
     */
    static async getClubs() {
        return await userRepository.getStickerClubs();
    }
}

