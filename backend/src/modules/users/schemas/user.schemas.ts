import { z } from "zod"
import { UserRole } from "../enums/user-role.enum"
import { nonEmptyString } from "../../../shared/validation/common"

/**
 * El `.meta({ id })` que aparece al final de cada schema "público" es metadata
 * estándar de Zod 4. La usamos como nombre del componente cuando se genera el
 * OpenAPI (zod-to-openapi lee `.meta()` para los `$ref`). No afecta la validación.
 */

/** PATCH /users/:userId — partial update. */
export const userUpdateRequestSchema = z
    .object({
        firstName: nonEmptyString.max(100),
        lastName: nonEmptyString.max(100),
        username: nonEmptyString.max(50),
        email: z.email(),
    })
    .partial()
    .refine(obj => Object.keys(obj).length > 0, { message: "Debe enviar al menos un campo a actualizar" })
    .meta({ id: "UserUpdateRequest" })

/**
 * Forma pública de un usuario expuesta por la API. Espeja `UserResponseDto`
 * (no incluye `auth0Sub` ni datos internos).
 */
export const userResponseSchema = z.object({
    id: nonEmptyString,
    firstName: z.string(),
    lastName: z.string(),
    username: z.string(),
    email: z.email(),
    role: z.enum([UserRole.STANDARD, UserRole.ADMIN]),
    reputation: z.number(),
}).meta({ id: "User" })
