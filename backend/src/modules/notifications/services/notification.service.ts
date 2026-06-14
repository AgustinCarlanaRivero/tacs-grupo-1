import {
    ForbiddenError,
    NotFoundError,
} from "../../../shared/errors/http-errors";
import { matchesAnyQuery, normalizeQuery } from "../../../shared/utils/query";
import { InAppChannel } from "../channels/in-app.channel";
import { NotificationChannel } from "../channels/notification-channel";
import { Notification } from "../entities/notification.entity";
import { NotificationType } from "../enums/notification-type.enum";
import notificationRepository from "../repositories/notification.repository";

class NotificationService {
    private channels: NotificationChannel[] = [new InAppChannel()];

    /**
     * Registra un nuevo canal de entrega (in-app, email, telegram, etc).
     * Cualquier `notify` posterior va a despachar por todos los canales registrados.
     */
    addChannel(channel: NotificationChannel) {
        this.channels.push(channel);
    }

    /**
     * Crea la notificación y la entrega por todos los canales de forma aislada:
     * si un canal falla, se loguea sin cortar a los demás (`Promise.allSettled`).
     * Así, p. ej., un fallo de Telegram no impide la entrega in-app.
     */
    async notify(
        userId: string,
        type: NotificationType,
        message: string,
        payload: Record<string, unknown> = {},
    ) {
        const notification = new Notification(userId, type, message, payload);

        const results = await Promise.allSettled(
            this.channels.map((channel) => channel.send(notification)),
        );

        results.forEach((result) => {
            if (result.status === "rejected") {
                console.error(
                    `Falló un canal de notificación (${type}):`,
                    result.reason,
                );
            }
        });

        return notification;
    }

    async getByUserId(userId: string, unreadOnly = false, query?: string) {
        const normalizedQuery = normalizeQuery(query);
        const notifications = unreadOnly
            ? await notificationRepository.findUnreadByUserId(userId)
            : await notificationRepository.findByUserId(userId);

        if (!normalizedQuery) return notifications;

        return notifications.filter((notification) => {
            const payloadText =
                Object.keys(notification.payload ?? {}).length > 0
                    ? JSON.stringify(notification.payload)
                    : undefined;
            return matchesAnyQuery(
                [notification.message, notification.type, payloadText],
                normalizedQuery,
            );
        });
    }

    /**
     * Marca como leída la notificación si pertenece al usuario indicado.
     * @throws NotFoundError 404 si no existe, ForbiddenError 403 si el usuario no es el dueño.
     */
    async markAsRead(notificationId: string, requesterId: string) {
        const notification =
            await notificationRepository.findById(notificationId);
        if (!notification) {
            throw new NotFoundError("Notificación no encontrada");
        }
        if (notification.userId !== requesterId) {
            throw new ForbiddenError(
                "No autorizado para marcar esta notificación",
            );
        }

        notification.read = true;
        return notificationRepository.save(notification);
    }

    async markAllAsRead(userId: string) {
        const unread = await notificationRepository.findUnreadByUserId(userId);
        await Promise.all(
            unread.map(async (n) => {
                n.read = true;
                await notificationRepository.save(n);
            }),
        );
        return { marked: unread.length };
    }

    async getUnreadCount(userId: string) {
        return {
            count: await notificationRepository.countUnreadByUserId(userId),
        };
    }
}

export default new NotificationService();
