import { Sticker } from "../entities/sticker.entity"

/**
 * Repositorio in-memory de stickers. Mantiene un índice principal por id y
 * índices secundarios para búsquedas rápidas.
 * Pensado para reemplazar por una implementación persistente (Mongo)
 * en próximas entregas.
 */
class StickerRepository {
    private stickers: Map<number, Sticker> = new Map()

    async findAll(): Promise<Sticker[]> {
        return Array.from(this.stickers.values())
    }

    async findById(id: number): Promise<Sticker | null> {
        return this.stickers.get(id) || null
    }

    async findByFilters(filters: {
        state?: string
        type?: string
        team?: string
        club?: string
    }): Promise<Sticker[]> {
        const all = Array.from(this.stickers.values())
        return all.filter(sticker => sticker.matchesFilters(filters))
    }

    async getPlayers(): Promise<string[]> {
        const players = new Set<string>()
        for (const sticker of Array.from(this.stickers.values())) {
            players.add(sticker.player.name)
        }
        return Array.from(players).sort()
    }

    async getTeams(): Promise<string[]> {
        const teams = new Set<string>()
        for (const sticker of Array.from(this.stickers.values())) {
            if (sticker.player.nationalTeam) {
                teams.add(sticker.player.nationalTeam.name)
            }
        }
        return Array.from(teams).sort()
    }

    async getClubs(): Promise<string[]> {
        const clubs = new Set<string>()
        for (const sticker of Array.from(this.stickers.values())) {
            if (sticker.player.club) {
                clubs.add(sticker.player.club.name)
            }
        }
        return Array.from(clubs).sort()
    }

    /**
     * Método auxiliar para agregar stickers en tests o inicialización.
     * No es parte de la interfaz pública del repositorio.
     */
    save(sticker: Sticker): void {
        this.stickers.set(sticker.number, sticker)
    }

    /**
     * Vacía los índices. Sólo se usa en tests para aislar casos.
     */
    clear(): void {
        this.stickers.clear()
    }
}

export default new StickerRepository()