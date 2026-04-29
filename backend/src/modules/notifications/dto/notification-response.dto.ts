import type { Notification } from "../entities/notification.entity"

/**
 * Forma pública de una notificación. Mantengo todos los campos de la entity
 * porque hoy no hay datos sensibles, pero el mapper actúa de barrera por si
 * mañana se agregan (ej. metadata interna).
 */
export interface NotificationResponseDto {
    id: string
    userId: string
    type: string
    message: string
    read: boolean
    payload: Record<string, unknown>
    createdAt: string
}

export function toNotificationResponseDto(n: Notification): NotificationResponseDto {
    return {
        id: n.id,
        userId: n.userId,
        type: n.type,
        message: n.message,
        read: n.read,
        payload: n.payload,
        createdAt: n.createdAt.toISOString(),
    }
}

export interface UnreadCountResponseDto {
    count: number
}

export interface MarkAllReadResponseDto {
    marked: number
}
