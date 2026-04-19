import { NotificationChannel } from "./notification-channel.ts"
import { Notification } from "../entities/notification.entity.ts"
import notificationRepository from "../repositories/notification.repository.ts"
import { notificationEmitter } from "../services/notification.emitter.ts"

export class InAppChannel implements NotificationChannel {
    async send(notification: Notification): Promise<void> {
        notificationRepository.save(notification)
        notificationEmitter.emit(notification.userId, notification)
    }
}
