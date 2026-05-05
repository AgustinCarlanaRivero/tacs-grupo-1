import { User } from "../users/entities/user.entity";
import { UserRole } from "../users/enums/user-role.enum";
import userRepository from "../users/repositories/user.repository";

export const USER_IDS = {
  admin: "seed-user-admin",
  ana: "seed-user-ana",
  bruno: "seed-user-bruno",
  carla: "seed-user-carla",
} as const;

type SeedUserInput = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  reputation: number;
};

export const USER_SEED_DATA: SeedUserInput[] = [
  {
    id: USER_IDS.admin,
    firstName: "Admin",
    lastName: "System",
    username: "admin",
    email: "admin@seed.local",
    role: UserRole.ADMIN,
    reputation: 4.9,
  },
  {
    id: USER_IDS.ana,
    firstName: "Ana",
    lastName: "Lopez",
    username: "analopez",
    email: "ana@seed.local",
    role: UserRole.STANDARD,
    reputation: 4.6,
  },
  {
    id: USER_IDS.bruno,
    firstName: "Bruno",
    lastName: "Diaz",
    username: "brunod",
    email: "bruno@seed.local",
    role: UserRole.STANDARD,
    reputation: 4.2,
  },
  {
    id: USER_IDS.carla,
    firstName: "Carla",
    lastName: "Perez",
    username: "carlap",
    email: "carla@seed.local",
    role: UserRole.STANDARD,
    reputation: 3.8,
  },
];

export function seedUsers(): User[] {
  const users = USER_SEED_DATA.map(
    (item) =>
      new User(
        item.firstName,
        item.lastName,
        item.username,
        item.email,
        item.role,
        item.reputation,
        null,
        item.id,
      ),
  );

  for (const user of users) {
    userRepository.save(user);
  }

  return users;
}
