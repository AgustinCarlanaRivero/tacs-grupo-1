import { z } from "zod"
import { UserRole } from "../../users/enums/user-role.enum"
import { nonEmptyString, nonNegativeInt } from "../../../shared/validation/common"

/** PATCH /admin/users/:userId/role */
export const roleUpdateRequestSchema = z.object({
    role: z.enum([UserRole.STANDARD, UserRole.ADMIN]),
}).meta({ id: "RoleUpdateRequest" })

export const roleUpdateResponseSchema = z.object({
    id: nonEmptyString,
    username: z.string(),
    role: z.enum([UserRole.STANDARD, UserRole.ADMIN]),
}).meta({ id: "RoleUpdateResponse" })

export const statsResponseSchema = z.object({
    users: z.object({
        total: nonNegativeInt,
        byRole: z.object({
            standard: nonNegativeInt,
            admin: nonNegativeInt,
        }),
        topByReputation: z.array(
            z.object({
                id: nonEmptyString,
                username: z.string(),
                reputation: z.number(),
            }),
        ),
    }),
    notifications: z.object({
        total: nonNegativeInt,
        unread: nonNegativeInt,
        read: nonNegativeInt,
        byType: z.record(z.string(), nonNegativeInt),
    }),
}).meta({ id: "Stats" })

export type RoleUpdateRequestDto  = z.infer<typeof roleUpdateRequestSchema>
export type RoleUpdateResponseDto = z.infer<typeof roleUpdateResponseSchema>
export type StatsResponseDto      = z.infer<typeof statsResponseSchema>
