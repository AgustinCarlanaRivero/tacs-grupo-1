import { seedCollections } from "./collection.seed";
import { seedPosts } from "./posts.seed";
import { seedStickers } from "./stickers.seed";
import { seedUsers } from "./users.seed";

let seeded = false;

export async function seedData(): Promise<void> {
  if (seeded) return;

  const stickers = seedStickers();
  const users = seedUsers();
  await seedCollections(users, stickers);
  seedPosts(users, stickers);

  seeded = true;
}
