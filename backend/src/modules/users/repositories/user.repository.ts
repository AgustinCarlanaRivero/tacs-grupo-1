import type { FilterQuery, HydratedDocument } from "mongoose";
import { BaseRepository } from "../../../infra/database/base.repository";
import type { Collection } from "../../collection/entities/collection.entity";
import { User } from "../entities/user.entity";
import { UserRole } from "../enums/user-role.enum";
import { UserModel } from "../schemas/user.model";

type UserPersistence = {
    _id: string;
    auth0Sub?: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: UserRole;
    reputation: number;
    collection: Collection | null;
};

class UserRepository extends BaseRepository<UserPersistence, User> {
    constructor() {
        super(UserModel);
    }

    protected toEntity(doc: HydratedDocument<UserPersistence>): User {
        return doc as unknown as User;
    }

    protected toPersistence(
        user: User,
    ): Partial<UserPersistence> & { _id?: string } {
        const id = user.id || crypto.randomUUID();
        if (!user.id) {
            user.setId(id);
        }

        return {
            _id: id,
            auth0Sub: user.auth0Sub || undefined,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role,
            reputation: user.reputation,
            collection: user.collection ?? null,
        };
    }

    async findByAuth0Sub(sub: string): Promise<User | null> {
        const doc = await UserModel.findOne({
            auth0Sub: sub,
        } as FilterQuery<UserPersistence>)
            .select("+auth0Sub")
            .exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findById(id: string): Promise<User | null> {
        return super.findById(id);
    }

    async findAll(): Promise<User[]> {
        return this.findMany();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({ email } as FilterQuery<UserPersistence>);
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.findOne({ username } as FilterQuery<UserPersistence>);
    }

    async save(user: User): Promise<User> {
        return super.save(user);
    }

    async delete(id: string): Promise<boolean> {
        return this.deleteById(id);
    }

    /**
     * Vacia los indices. Solo se usa en tests para aislar casos.
     */
    async clear(): Promise<void> {
        await this.deleteMany({} as FilterQuery<UserPersistence>);
    }
}

export default new UserRepository();
