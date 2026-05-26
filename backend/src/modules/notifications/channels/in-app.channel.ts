import { Notification } from "../entities/notification.entity";
import notificationRepository from "../repositories/notification.repository";
import { notificationEmitter } from "../services/notification.emitter";
import { NotificationChannel } from "./notification-channel";

export class InAppChannel implements NotificationChannel {
    async send(notification: Notification): Promise<void> {
        await notificationRepository.save(notification);
        notificationEmitter.emit(notification.userId, notification);
    }
}
