import authRepository from "../../auth/repositories/auth.repository";
import { User } from "../entities/user.entity";

class UserRepository {
    findAll(): User[] {
        return authRepository.findAll();
    }

    findById(id: string): User | undefined {
        return authRepository.findById(id);
    }

    findByEmail(email: string): User | undefined {
        return authRepository.findAll().find((user) => user.email === email);
    }

    findByUsername(username: string): User | undefined {
        return authRepository
            .findAll()
            .find((user) => user.username === username);
    }

    save(user: User): User {
        return authRepository.save(user);
    }

    delete(id: string): boolean {
        return authRepository.delete(id);
    }

    clear(): void {
        authRepository.clear();
    }
}

export default new UserRepository();
