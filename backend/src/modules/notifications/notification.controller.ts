import { Request, Response } from "express"
import NotificationService from "./notification.service.ts"

function paramAsString(value: string | string[] | undefined): string {
    if (value === undefined) return ""
    return Array.isArray(value) ? (value[0] ?? "") : value
}

export default class NotificationController {
    // GET /users/:userId/notifications
    getNotificationsByUser = async (req: Request, res: Response) => {
        const userId = paramAsString(req.params.userId)
        const notifications = await NotificationService.getNotificationsByUser(userId)
        return res.status(200).json(notifications)
    }

    // PATCH /notifications/:id/read
    markNotificationAsRead = async (req: Request, res: Response) => {
        const notificationId = paramAsString(req.params.id)
        const updatedNotification = await NotificationService.markNotificationAsRead(notificationId)
        return res.status(200).json(updatedNotification)
    }
}
