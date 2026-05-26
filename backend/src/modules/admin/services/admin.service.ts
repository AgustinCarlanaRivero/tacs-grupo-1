import {
    BadRequestError,
    NotFoundError,
} from "../../../shared/errors/http-errors";
import { NotificationType } from "../../notifications/enums/notification-type.enum";
import notificationRepository from "../../notifications/repositories/notification.repository";
import { UserRole } from "../../users/enums/user-role.enum";
import userRepository from "../../users/repositories/user.repository";
import {
    userResponseSchema,
    type UserResponseDto,
} from "../../users/schemas/user.schemas";
import {
    roleUpdateResponseSchema,
    statsResponseSchema,
    type RoleUpdateResponseDto,
    type StatsResponseDto,
} from "../schemas/admin.schemas";

export default class AdminService {
    /**
     * Devuelve estadísticas agregadas de uso de la plataforma. Hoy cubre usuarios
     * (totales y por rol) y notificaciones (totales, por tipo y por estado de
     * lectura). A medida que los módulos de posts/ofertas/subastas estén con
     * persistencia real, sumar acá las métricas correspondientes.
     */
    static async getStats(): Promise<StatsResponseDto> {
        const users = await userRepository.findAll();
        const notifications = await notificationRepository.findAll();

        const notificationsByType: Record<string, number> = {};
        for (const type of Object.values(NotificationType)) {
            notificationsByType[type] = 0;
        }
        let unread = 0;
        for (const n of notifications) {
            notificationsByType[n.type] =
                (notificationsByType[n.type] ?? 0) + 1;
            if (!n.read) unread++;
        }

        return statsResponseSchema.parse({
            users: {
                total: users.length,
                byRole: {
                    standard: users.filter((u) => u.role === UserRole.STANDARD)
                        .length,
                    admin: users.filter((u) => u.role === UserRole.ADMIN)
                        .length,
                },
                topByReputation: [...users]
                    .sort((a, b) => b.reputation - a.reputation)
                    .slice(0, 5)
                    .map((u) => ({
                        id: u.id,
                        username: u.username,
                        reputation: u.reputation,
                    })),
            },
            notifications: {
                total: notifications.length,
                unread,
                read: notifications.length - unread,
                byType: notificationsByType,
            },
        });
    }

    static async getUsers(): Promise<UserResponseDto[]> {
        const users = await userRepository.findAll();
        return users.map((u) => userResponseSchema.parse(u));
    }

    static async getUserById(userId: string): Promise<UserResponseDto> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado");
        }
        return userResponseSchema.parse(user);
    }

    /**
     * Cambia el rol de un usuario. Aplica dos guards:
     *  - un admin no puede degradar su propio rol (evita perder acceso por error).
     *  - el sistema no puede quedarse con 0 admins.
     *
     * @throws BadRequestError si el rol es inválido o se rompe alguno de los guards.
     * @throws NotFoundError si el usuario objetivo no existe.
     */
    static async updateUserRole(
        userId: string,
        newRole: string,
        requesterId: string,
    ): Promise<RoleUpdateResponseDto> {
        if (newRole !== UserRole.STANDARD && newRole !== UserRole.ADMIN) {
            throw new BadRequestError(
                "Rol inválido. Debe ser STANDARD o ADMIN",
            );
        }

        const user = await userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("Usuario no encontrado");
        }

        const isDemotingFromAdmin =
            user.role === UserRole.ADMIN && newRole !== UserRole.ADMIN;

        if (isDemotingFromAdmin && user.id === requesterId) {
            throw new BadRequestError(
                "Un admin no puede degradar su propio rol",
            );
        }

        if (isDemotingFromAdmin) {
            const remainingAdmins = (await userRepository.findAll()).filter(
                (u) => u.role === UserRole.ADMIN && u.id !== user.id,
            ).length;
            if (remainingAdmins === 0) {
                throw new BadRequestError(
                    "No se puede degradar al último admin",
                );
            }
        }

        user.role = newRole;
        await userRepository.save(user);

        return roleUpdateResponseSchema.parse({
            id: user.id,
            username: user.username,
            role: user.role,
        });
    }
}
