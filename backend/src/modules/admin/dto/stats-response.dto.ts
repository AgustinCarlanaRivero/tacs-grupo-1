/**
 * Forma del payload devuelto por `GET /admin/stats`. Si crece, sumar campos
 * acá explícitamente (no devolver el objeto entero del service sin filtrar).
 */
export interface StatsResponseDto {
    users: {
        total: number
        byRole: { standard: number; admin: number }
        topByReputation: { id: string; username: string; reputation: number }[]
    }
    notifications: {
        total: number
        unread: number
        read: number
        byType: Record<string, number>
    }
}
