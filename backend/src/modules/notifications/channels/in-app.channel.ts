import { NotificationChannel } from "./notification-channel"
import { Notification } from "../entities/notification.entity"
import notificationRepository from "../repositories/notification.repository"
import { notificationEmitter } from "../services/notification.emitter"

export class InAppChannel implements NotificationChannel {
    async send(notification: Notification): Promise<void> {
        notificationRepository.save(notification)
        notificationEmitter.emit(notification.userId, notification)
    }
}
