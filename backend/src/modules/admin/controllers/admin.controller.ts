import { Request, Response } from "express"
import type { z } from "zod"
import { UnauthorizedError } from "../../../shared/errors/http-errors"
import { roleUpdateRequestSchema } from "../schemas/admin.schemas"
import AdminService from "../services/admin.service"

type AuthenticatedRequest = Request & { user?: { id: string; role: string } }

export default class AdminController {
    /**
     * GET /admin/stats
     * Devuelve métricas agregadas de uso (usuarios, notificaciones).
     */
    getStats = async (_req: Request, res: Response) => {
        const stats = await AdminService.getStats()
        return res.status(200).json(stats)
    }

    getUsers = async (_req: Request, res: Response) => {
        const users = await AdminService.getUsers()
        return res.status(200).json(users)
    }

    getUserById = async (req: Request, res: Response) => {
        const { userId } = req.params as { userId: string }
        const user = await AdminService.getUserById(userId)
        return res.status(200).json(user)
    }

    /**
     * PATCH /admin/users/:userId/role
     * El body se valida con `roleUpdateRequestSchema` (ver `validation.middleware`).
     * El service aplica los guards de auto-degradación y último admin.
     */
    updateUserRole = async (req: Request, res: Response) => {
        const { userId } = req.params as { userId: string }
        const { role } = req.body as z.infer<typeof roleUpdateRequestSchema>

        const requesterId = (req as AuthenticatedRequest).user?.id
        if (!requesterId) {
            throw new UnauthorizedError()
        }

        const updated = await AdminService.updateUserRole(userId, role, requesterId)
        return res.status(200).json(updated)
    }
}
