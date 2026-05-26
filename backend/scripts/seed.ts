import { connectMongo, disconnectMongo } from "../src/infra/database/connection";
import { Collection } from "../src/modules/collection/entities/collection.entity";
import { Auction } from "../src/modules/posts/entities/auction.entity";
import { DirectTrade } from "../src/modules/posts/entities/direct-trade.entity";
import { PostModel } from "../src/modules/posts/schemas/post.model";
import { Category } from "../src/modules/stickers/entities/category.entity";
import { Sticker } from "../src/modules/stickers/entities/sticker.entity";
import { User } from "../src/modules/users/entities/user.entity";
import { UserRole } from "../src/modules/users/enums/user-role.enum";
import { UserModel } from "../src/modules/users/schemas/user.model";

// ============ CONSTANTS ============

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

type SeedStickerInput = {
  number: number;
  playerName: string;
  nationalTeamName: string;
  clubName: string;
  state: "NEW" | "DAMAGED";
  type: "REGULAR" | "SHINY";
  image?: string;
  description?: string;
};

export const STICKER_SEED_DATA: SeedStickerInput[] = [
  {
    number: 10,
    playerName: "Lionel Messi",
    nationalTeamName: "Argentina",
    clubName: "Inter Miami",
    state: "NEW",
    type: "SHINY",
    image: "https://assets1.afa.com.ar/media/DANI/NOVIEMBRE/WebN-messicgol2.jpg",
  },
  {
    number: 23,
    playerName: "Emiliano Martinez",
    nationalTeamName: "Argentina",
    clubName: "Aston Villa",
    state: "NEW",
    type: "REGULAR",
    image: "https://statics.eleconomista.com.ar/2022/11/63727a837ac3c.jpg",
  },
  {
    number: 11,
    playerName: "Angel Di Maria",
    nationalTeamName: "Argentina",
    clubName: "Benfica",
    state: "NEW",
    type: "SHINY",
    image: "https://www.clarin.com/2024/08/30/v6SPsl63z_2000x1500__1.jpg",
  },
  {
    number: 9,
    playerName: "Julian Alvarez",
    nationalTeamName: "Argentina",
    clubName: "Atletico Madrid",
    state: "NEW",
    type: "REGULAR",
    image: "https://fotos.perfil.com/2024/07/14/trim/1280/720/julian-alvarez-1835378.jpg",
  },
  {
    number: 7,
    playerName: "Rodrigo De Paul",
    nationalTeamName: "Argentina",
    clubName: "Atletico Madrid",
    state: "NEW",
    type: "REGULAR",
    image: "https://media.topmercato.com/arg/2024/07/ICONSPORT_232907_0033.jpg",
  },
  {
    number: 8,
    playerName: "Enzo Fernandez",
    nationalTeamName: "Argentina",
    clubName: "Chelsea",
    state: "NEW",
    type: "REGULAR",
    image: "https://media.lmneuquen.com/p/072c3680e4a33f817d9a0d90a9273352/adjuntos/195/imagenes/007/736/0007736389/770x0/smart/enzo-fernandez-1jpg.jpg",
  },
  {
    number: 12,
    playerName: "Kylian Mbappe",
    nationalTeamName: "Francia",
    clubName: "Real Madrid",
    state: "NEW",
    type: "SHINY",
    image: "https://abcmundial.com/sites/default/files/noticias/2022/05/21/Kylian%20Mbappe%20signs%20new%20three-year%20deal%20with%20PSG.%C2%A0.jpg",
  },
];

type SeedPostInput =
  | {
      id: string;
      kind: "DIRECT_TRADE";
      ownerId: string;
      stickerNumber: number;
    }
  | {
      id: string;
      kind: "AUCTION";
      ownerId: string;
      stickerNumber: number;
      minimumRequirement: number;
      endsInDays: number;
    };

export const POST_SEED_DATA: SeedPostInput[] = [
  {
    id: "seed-post-trade-ana-7",
    kind: "DIRECT_TRADE",
    ownerId: USER_IDS.ana,
    stickerNumber: 7,
  },
  {
    id: "seed-post-auction-bruno-11",
    kind: "AUCTION",
    ownerId: USER_IDS.bruno,
    stickerNumber: 11,
    minimumRequirement: 2,
    endsInDays: 10,
  },
  {
    id: "seed-post-trade-carla-9",
    kind: "DIRECT_TRADE",
    ownerId: USER_IDS.carla,
    stickerNumber: 9,
  },
  {
    id: "seed-post-auction-ana-10",
    kind: "AUCTION",
    ownerId: USER_IDS.ana,
    stickerNumber: 10,
    minimumRequirement: 1,
    endsInDays: 7,
  },
  {
    id: "seed-post-trade-bruno-23",
    kind: "DIRECT_TRADE",
    ownerId: USER_IDS.bruno,
    stickerNumber: 23,
  },
  {
    id: "seed-post-auction-carla-12",
    kind: "AUCTION",
    ownerId: USER_IDS.carla,
    stickerNumber: 12,
    minimumRequirement: 2,
    endsInDays: 5,
  },
  {
    id: "seed-post-trade-ana-8",
    kind: "DIRECT_TRADE",
    ownerId: USER_IDS.ana,
    stickerNumber: 8,
  },
  {
    id: "seed-post-auction-bruno-9",
    kind: "AUCTION",
    ownerId: USER_IDS.bruno,
    stickerNumber: 9,
    minimumRequirement: 3,
    endsInDays: 12,
  },
  {
    id: "seed-post-trade-carla-11",
    kind: "DIRECT_TRADE",
    ownerId: USER_IDS.carla,
    stickerNumber: 11,
  },
];

type SeedCollectionInput = {
  userId: string;
  items: Array<{ stickerNumber: number; quantity: number }>;
  missingStickerNumbers: number[];
};

export const COLLECTION_SEED_DATA: SeedCollectionInput[] = [
  {
    userId: USER_IDS.ana,
    items: [
      { stickerNumber: 10, quantity: 2 },
      { stickerNumber: 23, quantity: 1 },
      { stickerNumber: 8, quantity: 1 },
    ],
    missingStickerNumbers: [9, 12],
  },
  {
    userId: USER_IDS.bruno,
    items: [
      { stickerNumber: 11, quantity: 3 },
      { stickerNumber: 7, quantity: 1 },
      { stickerNumber: 9, quantity: 2 },
    ],
    missingStickerNumbers: [10, 23],
  },
  {
    userId: USER_IDS.carla,
    items: [
      { stickerNumber: 12, quantity: 1 },
      { stickerNumber: 8, quantity: 2 },
      { stickerNumber: 10, quantity: 1 },
    ],
    missingStickerNumbers: [7, 11],
  },
];

// ============ SEED FUNCTIONS ============

function seedStickers(): Sticker[] {
  const stickers = STICKER_SEED_DATA.map((item) => {
    const player = {
      name: item.playerName,
      nationalTeam: { name: item.nationalTeamName },
      club: { name: item.clubName },
      image: item.image ?? "",
    };

    return new Sticker(
      item.number,
      player as Sticker["player"],
      new Category(item.state, item.type),
      item.description ?? "",
    );
  });

  return stickers;
}

async function seedUsers(): Promise<User[]> {
  console.log("Seeding users...");
  
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
    const userDoc = {
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      reputation: user.reputation,
      collection: null,
      auth0Sub: undefined,
    };

    await UserModel.findByIdAndUpdate(
      user.id,
      userDoc,
      { upsert: true, new: true },
    );
  }

  console.log(`Seeded ${users.length} users`);
  return users;
}

async function seedPosts(
  users: User[],
  stickers: Sticker[],
): Promise<void> {
  console.log("🌱 Seeding posts...");

  const usersById = new Map(users.map((user) => [user.id, user]));
  const stickersById = new Map(
    stickers.map((sticker) => [sticker.number, sticker]),
  );

  const posts = POST_SEED_DATA.flatMap((item) => {
    const owner = usersById.get(item.ownerId);
    const sticker = stickersById.get(item.stickerNumber);
    if (!owner || !sticker) return [];

    if (item.kind === "DIRECT_TRADE") {
      return [new DirectTrade(owner, sticker, undefined, [], item.id)];
    }

    const createdAt = new Date();
    const endsAt = new Date(createdAt);
    endsAt.setDate(endsAt.getDate() + item.endsInDays);

    return [
      new Auction(
        owner,
        sticker,
        createdAt,
        endsAt,
        item.minimumRequirement,
        undefined,
        [],
        item.id,
      ),
    ];
  });

  for (const post of posts) {
    const postPersistence: Record<string, unknown> = {
      _id: post.id,
      type: post.getType(),
      state: post.state,
      ownerId: post.owner.id,
      sticker: post.sticker,
    };

    if (post instanceof Auction) {
      postPersistence.createdAt = post.createdAt;
      postPersistence.endsAt = post.endsAt;
      postPersistence.minimumRequirement = post.minimumRequirement;
    }

    await PostModel.findByIdAndUpdate(post.id, postPersistence, {
      upsert: true,
      new: true,
    });
  }

  console.log(`Seeded ${posts.length} posts`);
}

async function seedCollections(
  users: User[],
  stickers: Sticker[],
): Promise<void> {
  console.log("Seeding collections...");

  const usersById = new Map(users.map((user) => [user.id, user]));
  const stickersById = new Map(
    stickers.map((sticker) => [sticker.number, sticker]),
  );

  for (const item of COLLECTION_SEED_DATA) {
    const user = usersById.get(item.userId);
    if (!user) continue;

    const collection = new Collection();

    for (const entry of item.items) {
      const sticker = stickersById.get(entry.stickerNumber);
      if (!sticker) continue;
      collection.addItem({ sticker, quantity: entry.quantity });
    }

    for (const missingStickerNumber of item.missingStickerNumbers) {
      const sticker = stickersById.get(missingStickerNumber);
      if (!sticker) continue;
      collection.addMissing(sticker);
    }

    user.collection = collection;

    // Update user with collection
    await UserModel.findByIdAndUpdate(
      user.id,
      { collection },
      { new: true },
    );
  }

  console.log(`Seeded collections for ${COLLECTION_SEED_DATA.length} users`);
}

// ============ MAIN EXECUTION ============

async function main(): Promise<void> {
  try {
    const shouldReset = process.argv.includes("--reset");

    console.log("\nStarting seed script...\n");

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectMongo();
    console.log("Connected to MongoDB\n");

    // Optional: Clear existing seed data
    if (shouldReset) {
      console.log("Resetting seed data...");
      await UserModel.deleteMany({
        _id: { $in: Object.values(USER_IDS) },
      });
      await PostModel.deleteMany({
        _id: { $regex: "^seed-post" },
      });
      console.log("Seed data cleared\n");
    }

    // Run seeds
    const stickers = seedStickers();
    const users = await seedUsers();
    await seedCollections(users, stickers);
    await seedPosts(users, stickers);

    console.log("\nAll seeds completed successfully!\n");

    // Disconnect
    await disconnectMongo();
    console.log("Disconnected from MongoDB\n");
    process.exit(0);
  } catch (error) {
    console.error("\nSeed script failed:", error);
    await disconnectMongo().catch(() => {});
    process.exit(1);
  }
}

main();
