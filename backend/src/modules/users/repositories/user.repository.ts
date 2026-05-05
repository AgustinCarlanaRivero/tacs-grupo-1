import { User } from "../entities/user.entity";

/**
 * Repositorio in-memory de usuarios. Mantiene dos índices: por id interno y por
 * Auth0 sub. Pensado para reemplazar por una implementación persistente (Mongo)
 * en próximas entregas.
 */
class UserRepository {
    private users: Map<string, User> = new Map();
    private auth0Index: Map<string, string> = new Map();

    findByAuth0Sub(sub: string): User | undefined {
        const id = this.auth0Index.get(sub);
        if (!id) return undefined;
        return this.users.get(id);
    }

    findById(id: string): User | undefined {
        return this.users.get(id);
    }

    findAll(): User[] {
        return Array.from(this.users.values());
    }

    findByEmail(email: string): User | undefined {
        return this.findAll().find((user) => user.email === email);
    }

    findByUsername(username: string): User | undefined {
        return this.findAll().find((user) => user.username === username);
    }

    save(user: User): User {
        this.users.set(user.id, user);
        if (user.auth0Sub) {
            this.auth0Index.set(user.auth0Sub, user.id);
        }
        return user;
    }

    delete(id: string): boolean {
        const user = this.users.get(id);
        if (!user) return false;

        this.users.delete(id);
        if (user.auth0Sub) {
            this.auth0Index.delete(user.auth0Sub);
        }

        return true;
    }

    /**
     * Vacia los indices. Solo se usa en tests para aislar casos.
     */
    clear(): void {
        this.users.clear();
        this.auth0Index.clear();
    }
}

export default new UserRepository();
