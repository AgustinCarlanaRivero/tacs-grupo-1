import { EventEmitter } from "events"
import { Notification } from "../entities/notification.entity.ts"

class NotificationEmitter {
    private emitter = new EventEmitter()

    constructor() {
        this.emitter.setMaxListeners(0)
    }

    emit(userId: string, notification: Notification) {
        this.emitter.emit(`notification:${userId}`, notification)
    }

    subscribe(userId: string, listener: (notification: Notification) => void) {
        this.emitter.on(`notification:${userId}`, listener)
    }

    unsubscribe(userId: string, listener: (notification: Notification) => void) {
        this.emitter.off(`notification:${userId}`, listener)
    }
}

export const notificationEmitter = new NotificationEmitter()
