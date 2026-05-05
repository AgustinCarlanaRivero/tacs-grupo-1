export type PaginatedResult<T> = {
    data: T[]
    page: number
    limit: number
    total: number
}

export function paginate<T>(items: T[], page: number, limit: number): PaginatedResult<T> {
    const total = items.length
    const start = (page - 1) * limit
    const end = start + limit
    return {
        data: items.slice(start, end),
        page,
        limit,
        total,
    }
}

export function normalizeQuery(query?: string): string | undefined {
    if (!query) return undefined
    const trimmed = query.trim().toLowerCase()
    return trimmed.length > 0 ? trimmed : undefined
}

export function matchesQuery(value: string | undefined | null, query?: string): boolean {
    if (!query) return true
    if (!value) return false
    return value.toLowerCase().includes(query.toLowerCase())
}

export function matchesAnyQuery(values: Array<string | undefined | null>, query?: string): boolean {
    if (!query) return true
    return values.some(value => matchesQuery(value, query))
}

type NameLike = string | { name?: string | null } | null | undefined

export type StickerSearchInput = {
    id?: string | number
    number?: number
    title?: string
    description?: string
    player?: {
        name?: string | null
        nationalTeam?: NameLike
        club?: NameLike
    } | null
    getDisplayName?: () => string
} | null | undefined

function nameFrom(value: NameLike): string | undefined {
    if (!value) return undefined
    if (typeof value === "string") return value
    return value.name ?? undefined
}

export function getStickerSearchValues(sticker: StickerSearchInput): Array<string | undefined> {
    if (!sticker) return []

    const displayName = sticker.getDisplayName?.() ?? sticker.title
    const numberValue = sticker.number !== undefined ? String(sticker.number) : undefined
    const idValue = sticker.id !== undefined ? String(sticker.id) : undefined
    const playerName = sticker.player?.name ?? undefined
    const nationalTeam = nameFrom(sticker.player?.nationalTeam)
    const club = nameFrom(sticker.player?.club)

    return [displayName, sticker.description, playerName, nationalTeam, club, numberValue, idValue]
}
