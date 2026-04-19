import { Notification } from "../entities/notification.entity.ts"

export interface NotificationChannel {
    send(notification: Notification): Promise<void>
}
