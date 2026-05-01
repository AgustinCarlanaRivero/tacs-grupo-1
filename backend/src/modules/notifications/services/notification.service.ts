import { Notification } from "../entities/notification.entity"
import { NotificationType } from "../enums/notification-type.enum"
import { NotificationChannel } from "../channels/notification-channel"
import { InAppChannel } from "../channels/in-app.channel"
import { ForbiddenError, NotFoundError } from "../../../shared/errors/http-errors"
import notificationRepository from "../repositories/notification.repository"

class NotificationService {
    private channels: NotificationChannel[] = [new InAppChannel()]

    /**
     * Registra un nuevo canal de entrega (in-app, email, telegram, etc).
     * Cualquier `notify` posterior va a despachar por todos los canales registrados.
     */
    addChannel(channel: NotificationChannel) {
        this.channels.push(channel)
    }

    /**
     * Crea la notificación y la entrega por todos los canales en paralelo.
     * Si un canal falla, propaga el error (Promise.all).
     */
    async notify(
        userId: string,
        type: NotificationType,
        message: string,
        payload: Record<string, unknown> = {},
    ) {
        const notification = new Notification(userId, type, message, payload)

        await Promise.all(
            this.channels.map(channel => channel.send(notification))
        )

        return notification
    }

    async getByUserId(userId: string, unreadOnly = false) {
        if (unreadOnly) {
            return notificationRepository.findUnreadByUserId(userId)
        }
        return notificationRepository.findByUserId(userId)
    }

    /**
     * Marca como leída la notificación si pertenece al usuario indicado.
     * @throws AppError 404 si no existe, 403 si el usuario no es el dueño.
     */
    async markAsRead(notificationId: string, requesterId: string) {
        const notification = notificationRepository.findById(notificationId)
        if (!notification) {
            throw new NotFoundError("Notificación no encontrada")
        }
        if (notification.userId !== requesterId) {
            throw new ForbiddenError("No autorizado para marcar esta notificación")
        }

        notification.read = true
        return notificationRepository.save(notification)
    }

    async markAllAsRead(userId: string) {
        const unread = notificationRepository.findUnreadByUserId(userId)
        unread.forEach(n => {
            n.read = true
            notificationRepository.save(n)
        })
        return { marked: unread.length }
    }

    async getUnreadCount(userId: string) {
        return { count: notificationRepository.countUnreadByUserId(userId) }
    }
}

export default new NotificationService()
