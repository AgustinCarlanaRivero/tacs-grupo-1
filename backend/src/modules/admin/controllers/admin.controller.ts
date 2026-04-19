import { Request, Response } from "express"
import AdminService from "../services/admin.service.ts"

export default class AdminController {
    getStats = async (_req: Request, res: Response) => {
        const stats = await AdminService.getStats()
        return res.status(200).json(stats)
    }

    getUsers = async (_req: Request, res: Response) => {
        const users = await AdminService.getUsers()
        return res.status(200).json(users)
    }

    getUserById = async (req: Request, res: Response) => {
        const { userId } = req.params
        const user = await AdminService.getUserById(userId)
        return res.status(200).json(user)
    }

    updateUserRole = async (req: Request, res: Response) => {
        const { userId } = req.params
        const { role } = req.body as { role?: string }

        if (!role) {
            return res.status(400).json({ error: "El campo 'role' es requerido" })
        }

        const updated = await AdminService.updateUserRole(userId, role)
        return res.status(200).json(updated)
    }
}
