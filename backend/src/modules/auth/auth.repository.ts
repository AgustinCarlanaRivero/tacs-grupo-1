import { User } from "../users/user.entity.ts"

class AuthRepository {
    private users: Map<string, User> = new Map()
    private auth0Index: Map<string, string> = new Map()

    findByAuth0Sub(sub: string): User | undefined {
        const id = this.auth0Index.get(sub)
        if (!id) return undefined
        return this.users.get(id)
    }

    findById(id: string): User | undefined {
        return this.users.get(id)
    }

    save(user: User): User {
        this.users.set(user.id, user)
        if (user.auth0Sub) {
            this.auth0Index.set(user.auth0Sub, user.id)
        }
        return user
    }
}

export default new AuthRepository()
