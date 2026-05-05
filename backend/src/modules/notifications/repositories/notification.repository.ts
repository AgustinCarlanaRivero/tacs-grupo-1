import { Notification } from "../entities/notification.entity"

class NotificationRepository {
    private notifications: Map<string, Notification> = new Map()
    private userIndex: Map<string, string[]> = new Map()

    save(notification: Notification): Notification {
        const isNew = !this.notifications.has(notification.id)
        this.notifications.set(notification.id, notification)

        if (isNew) {
            const userNotifications = this.userIndex.get(notification.userId) ?? []
            userNotifications.push(notification.id)
            this.userIndex.set(notification.userId, userNotifications)
        }

        return notification
    }

    findById(id: string): Notification | undefined {
        return this.notifications.get(id)
    }

    findByUserId(userId: string): Notification[] {
        const ids = this.userIndex.get(userId) ?? []
        return ids
            .map(id => this.notifications.get(id))
            .filter((n): n is Notification => n !== undefined)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    findUnreadByUserId(userId: string): Notification[] {
        return this.findByUserId(userId).filter(n => !n.read)
    }

    countUnreadByUserId(userId: string): number {
        return this.findUnreadByUserId(userId).length
    }

    countAll(): number {
        return this.notifications.size
    }

    findAll(): Notification[] {
        return Array.from(this.notifications.values())
    }

    /**
     * Vacía los índices. Sólo se usa en tests para aislar casos.
     */
    clear(): void {
        this.notifications.clear()
        this.userIndex.clear()
    }
}

export default new NotificationRepository()
