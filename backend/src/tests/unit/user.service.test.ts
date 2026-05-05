import { User } from "../../modules/users/entities/user.entity";
import userRepository from "../../modules/users/repositories/user.repository";
import UserService from "../../modules/users/services/user.service";
import { ConflictError, NotFoundError } from "../../shared/errors/http-errors";

describe("UserService", () => {
    beforeEach(() => {
        userRepository.clear();
    });

    test("getUsers returns paginated result", async () => {
        const u1 = new User("A", "One", "aone", "a@x.com");
        u1.setId("u1");
        const u2 = new User("B", "Two", "btwo", "b@x.com");
        u2.setId("u2");
        userRepository.save(u1);
        userRepository.save(u2);

        const res = await UserService.getUsers({ page: 1, limit: 10 });
        expect(res.total).toBe(2);
        expect(res.data.length).toBe(2);
        expect(res.page).toBe(1);
        expect(res.limit).toBe(10);
    });

    test("getUserById throws NotFoundError when absent", async () => {
        await expect(UserService.getUserById("nope")).rejects.toThrow(
            NotFoundError,
        );
    });

    test("updateUser throws ConflictError when username already in use", async () => {
        const a = new User("A", "One", "same", "a@x.com");
        a.setId("a");
        const b = new User("B", "Two", "other", "b@x.com");
        b.setId("b");
        userRepository.save(a);
        userRepository.save(b);

        await expect(
            UserService.updateUser("b", { username: "same" } as any),
        ).rejects.toThrow(ConflictError);
    });
});
