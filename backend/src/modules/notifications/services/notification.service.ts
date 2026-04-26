import { Notification } from "../entities/notification.entity"
import { NotificationType } from "../enums/notification-type.enum"
import { NotificationChannel } from "../channels/notification-channel"
import { InAppChannel } from "../channels/in-app.channel"
import { AppError } from "../../../shared/errors/app-error"
import notificationRepository from "../repositories/notification.repository"

class NotificationService {
    private channels: NotificationChannel[] = [new InAppChannel()]

    addChannel(channel: NotificationChannel) {
        this.channels.push(channel)
    }

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

    async markAsRead(notificationId: string) {
        const notification = notificationRepository.findById(notificationId)
        if (!notification) {
            throw new AppError("Notificación no encontrada", 404)
        }

        notification.read = true
        return notification
    }

    async markAllAsRead(userId: string) {
        const unread = notificationRepository.findUnreadByUserId(userId)
        unread.forEach(n => { n.read = true })
        return { marked: unread.length }
    }

    async getUnreadCount(userId: string) {
        return { count: notificationRepository.countUnreadByUserId(userId) }
    }
}

export default new NotificationService()
