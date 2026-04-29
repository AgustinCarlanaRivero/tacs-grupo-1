import type { User } from "../../users/entities/user.entity"

/**
 * Forma pública del usuario expuesta por la API. No incluye `auth0Sub` ni
 * datos internos. Si se agrega un campo sensible al modelo, **no aparece acá
 * a menos que se mapee explícitamente** — esto es lo que evita filtraciones.
 */
export interface UserResponseDto {
    id: string
    firstName: string
    lastName: string
    username: string
    email: string
    role: string
    reputation: number
}

export function toUserResponseDto(user: User): UserResponseDto {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        reputation: user.reputation,
    }
}
