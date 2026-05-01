import { Sticker } from "../../../../modules/stickers/sticker.entity"

export class StickerRepository {
    static async findAll(): Promise<Sticker[]> {
        // TODO: Implementar consulta a BD
        throw new Error("Not implemented")
    }

    static async findById(id: number): Promise<Sticker | null> {
        // TODO: Implementar consulta a BD
        throw new Error("Not implemented")
    }

    static async findByFilters(filters: {
        state?: string
        type?: string
        team?: string
        club?: string
    }): Promise<Sticker[]> {
        // TODO: Implementar consulta a BD con filtros
        throw new Error("Not implemented")
    }

    static async getPlayers(): Promise<any[]> {
        // TODO: Implementar consulta a BD
        throw new Error("Not implemented")
    }

    static async getTeams(): Promise<any[]> {
        // TODO: Implementar consulta a BD
        throw new Error("Not implemented")
    }

    static async getClubs(): Promise<any[]> {
        // TODO: Implementar consulta a BD
        throw new Error("Not implemented")
    }
}