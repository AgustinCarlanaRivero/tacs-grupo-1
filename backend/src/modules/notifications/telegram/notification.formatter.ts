import type { Notification } from "../entities/notification.entity";
import { NotificationType } from "../enums/notification-type.enum";

const TYPE_LABELS: Record<string, string> = {
    [NotificationType.STICKER_AVAILABLE]: "🃏 Figurita disponible",
    [NotificationType.AUCTION_ENDING]: "⏰ Subasta por terminar",
    [NotificationType.OFFER_RECEIVED]: "📨 Oferta recibida",
    [NotificationType.OFFER_ACCEPTED]: "✅ Oferta aceptada",
    [NotificationType.OFFER_REJECTED]: "❌ Oferta rechazada",
    [NotificationType.RATING_RECEIVED]: "⭐ Calificación recibida",
};

function formatNotificationLine(notification: Notification): string {
    const label = TYPE_LABELS[notification.type] ?? notification.type;
    const date = notification.createdAt.toLocaleDateString("es-AR");
    return `${label}\n   ${notification.message} · ${date}`;
}

/** Mensaje suelto para el push de una notificación (canal de Telegram). */
export function formatNotificationMessage(notification: Notification): string {
    const label = TYPE_LABELS[notification.type] ?? notification.type;
    return `${label}\n${notification.message}`;
}

/**
 * Texto de una página de notificaciones. El service devuelve la lista completa,
 * así que paginamos acá cortando el slice correspondiente.
 */
export function formatNotificationsPage(
    items: Notification[],
    page: number,
    limit: number,
): string {
    const title = "🔔 Tus notificaciones sin leer";

    if (items.length === 0) {
        return `${title}\n\n¡Estás al día! No tenés notificaciones sin leer. 🎉`;
    }

    const pages = Math.max(1, Math.ceil(items.length / limit));
    const start = (page - 1) * limit;
    const lines = items
        .slice(start, start + limit)
        .map(formatNotificationLine)
        .join("\n\n");

    return (
        `${title} (página ${page}/${pages} · ${items.length} sin leer)\n\n` +
        lines
    );
}
