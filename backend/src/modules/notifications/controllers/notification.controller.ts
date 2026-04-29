import { Request, Response } from "express"
import { AppError } from "../../../shared/errors/app-error"
import { ForbiddenError, UnauthorizedError } from "../../../shared/errors/http-errors"
import { UserRole } from "../../users/enums/user-role.enum"
import notificationService from "../services/notification.service"
import { notificationEmitter } from "../services/notification.emitter"
import { Notification } from "../entities/notification.entity"
import { toNotificationResponseDto } from "../dto/notification-response.dto"

type AuthenticatedRequest = Request & { user?: { id: string; role: string } }

const SSE_HEARTBEAT_MS = 25_000

function requireSelfOrAdmin(req: Request, targetUserId: string): string {
    const user = (req as AuthenticatedRequest).user
    if (!user) {
        throw new UnauthorizedError()
    }
    if (user.id !== targetUserId && user.role !== UserRole.ADMIN) {
        throw new ForbiddenError()
    }
    return user.id
}

export default class NotificationController {
    /**
     * GET /users/:userId/notifications
     * Sólo el dueño (o un admin) puede listar las notificaciones del usuario.
     */
    getNotificationsByUser = async (req: Request, res: Response) => {
        const userId = String(req.params.userId)
        requireSelfOrAdmin(req, userId)

        const unreadOnly = req.query.unread === "true"
        const notifications = await notificationService.getByUserId(userId, unreadOnly)
        return res.status(200).json(notifications.map(toNotificationResponseDto))
    }

    getUnreadCount = async (req: Request, res: Response) => {
        const userId = (req as AuthenticatedRequest).user?.id
        if (!userId) {
            throw new UnauthorizedError()
        }
        const result = await notificationService.getUnreadCount(userId)
        return res.status(200).json(result)
    }

    /**
     * PATCH /notifications/:id/read
     * El service valida que la notificación pertenezca al usuario autenticado.
     */
    markAsRead = async (req: Request, res: Response) => {
        const userId = (req as AuthenticatedRequest).user?.id
        if (!userId) {
            throw new UnauthorizedError()
        }
        const id = String(req.params.id)
        const notification = await notificationService.markAsRead(id, userId)
        return res.status(200).json(toNotificationResponseDto(notification))
    }

    markAllAsRead = async (req: Request, res: Response) => {
        const userId = (req as AuthenticatedRequest).user?.id
        if (!userId) {
            throw new UnauthorizedError()
        }
        const result = await notificationService.markAllAsRead(userId)
        return res.status(200).json(result)
    }

    /**
     * GET /users/:userId/notifications/stream
     * Server-Sent Events. Sólo el dueño (o un admin) puede suscribirse.
     * Mantiene la conexión viva con un comment-line periódico para evitar
     * timeouts intermedios de proxies/load balancers.
     */
    stream = (req: Request, res: Response) => {
        const userId = String(req.params.userId)
        try {
            requireSelfOrAdmin(req, userId)
        } catch (err) {
            if (err instanceof AppError) {
                res.status(err.statusCode).json({ error: err.message })
                return
            }
            throw err
        }

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        })

        res.write("data: {\"type\":\"connected\"}\n\n")

        const listener = (notification: Notification) => {
            res.write(`data: ${JSON.stringify(toNotificationResponseDto(notification))}\n\n`)
        }

        notificationEmitter.subscribe(userId, listener)

        const heartbeat = setInterval(() => {
            res.write(": ping\n\n")
        }, SSE_HEARTBEAT_MS)

        req.on("close", () => {
            clearInterval(heartbeat)
            notificationEmitter.unsubscribe(userId, listener)
        })
    }
}
