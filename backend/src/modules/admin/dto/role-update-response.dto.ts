/**
 * Resultado del PATCH de cambio de rol. Pequeño a propósito: el cliente sólo
 * necesita confirmar el nuevo estado.
 */
export interface RoleUpdateResponseDto {
    id: string
    username: string
    role: string
}
