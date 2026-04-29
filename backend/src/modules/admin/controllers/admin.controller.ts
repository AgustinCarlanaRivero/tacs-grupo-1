import { Request, Response } from "express"
import { z } from "zod"
import { UnauthorizedError } from "../../../shared/errors/http-errors"
import { UserRole } from "../../users/enums/user-role.enum"
import AdminService from "../services/admin.service"

type AuthenticatedRequest = Request & { user?: { id: string; role: string } }

export const updateRoleSchema = z.object({
    role: z.enum([UserRole.STANDARD, UserRole.ADMIN]),
})

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
        const userId = String(req.params.userId)
        const user = await AdminService.getUserById(userId)
        return res.status(200).json(user)
    }

    /**
     * PATCH /admin/users/:userId/role
     * El body se valida con `updateRoleSchema` (ver `validation.middleware`).
     * El service aplica los guards de auto-degradación y último admin.
     */
    updateUserRole = async (req: Request, res: Response) => {
        const userId = String(req.params.userId)
        const { role } = req.body as z.infer<typeof updateRoleSchema>

        const requesterId = (req as AuthenticatedRequest).user?.id
        if (!requesterId) {
            throw new UnauthorizedError()
        }

        const updated = await AdminService.updateUserRole(userId, role, requesterId)
        return res.status(200).json(updated)
    }
}
