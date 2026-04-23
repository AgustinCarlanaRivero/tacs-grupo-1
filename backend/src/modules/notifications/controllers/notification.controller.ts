import { Request, Response } from "express"
import { AppError } from "../../../shared/errors/app-error"
import notificationService from "../services/notification.service"
import { notificationEmitter } from "../services/notification.emitter"
import { Notification } from "../entities/notification.entity"

type AuthenticatedRequest = Request & { user?: { id: string; role: string } }

export default class NotificationController {
    getNotificationsByUser = async (req: Request, res: Response) => {
        const { userId } = req.params
        const unreadOnly = req.query.unread === "true"
        const notifications = await notificationService.getByUserId(userId, unreadOnly)
        return res.status(200).json(notifications)
    }

    getUnreadCount = async (req: Request, res: Response) => {
        const userId = (req as AuthenticatedRequest).user?.id
        if (!userId) {
            throw new AppError("No autenticado", 401)
        }
        const result = await notificationService.getUnreadCount(userId)
        return res.status(200).json(result)
    }

    markAsRead = async (req: Request, res: Response) => {
        const { id } = req.params
        const notification = await notificationService.markAsRead(id)
        return res.status(200).json(notification)
    }

    markAllAsRead = async (req: Request, res: Response) => {
        const userId = (req as AuthenticatedRequest).user?.id
        if (!userId) {
            throw new AppError("No autenticado", 401)
        }
        const result = await notificationService.markAllAsRead(userId)
        return res.status(200).json(result)
    }

    stream = async (req: Request, res: Response) => {
        const userId = (req as AuthenticatedRequest).user?.id
        if (!userId) {
            throw new AppError("No autenticado", 401)
        }

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        })

        res.write("data: {\"type\":\"connected\"}\n\n")

        const listener = (notification: Notification) => {
            res.write(`data: ${JSON.stringify(notification)}\n\n`)
        }

        notificationEmitter.subscribe(userId, listener)

        req.on("close", () => {
            notificationEmitter.unsubscribe(userId, listener)
        })
    }
}
