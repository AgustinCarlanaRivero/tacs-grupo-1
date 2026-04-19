import { NotificationType } from "../enums/notification-type.enum.ts"

export class Notification {
    id: string
    userId: string
    type: NotificationType
    message: string
    read: boolean
    payload: Record<string, unknown>
    createdAt: Date

    constructor(
        userId: string,
        type: NotificationType,
        message: string,
        payload: Record<string, unknown> = {},
    ) {
        this.id = crypto.randomUUID()
        this.userId = userId
        this.type = type
        this.message = message
        this.read = false
        this.payload = payload
        this.createdAt = new Date()
    }
}
