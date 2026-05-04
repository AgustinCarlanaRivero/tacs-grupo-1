import authRepository from "../../auth/repositories/auth.repository"
import { toUserResponseDto } from "../../auth/dto/user-response.dto"
import { matchesAnyQuery, normalizeQuery, paginate } from "../../../shared/utils/query"

type UserListFilters = {
    query?: string
    page: number
    limit: number
}

export default class UserService {
    static async getUsers(filters: UserListFilters) {
        const normalizedQuery = normalizeQuery(filters.query)
        const users = authRepository.findAll()
        const filtered = normalizedQuery
            ? users.filter(user => matchesAnyQuery(
                [user.firstName, user.lastName, user.username, user.email],
                normalizedQuery,
            ))
            : users

        const data = filtered.map(toUserResponseDto)
        return paginate(data, filters.page, filters.limit)
    }

    static async getUserById() {
        return []
    }

    static async updateUser() {
        return []
    }
    
    static async deleteUser() {
        return []
    }
}
