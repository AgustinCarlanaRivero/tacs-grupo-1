import { Collection } from "../collection/entities/collection.entity";
import collectionRepository from "../collection/repositories/collection.repository";
import { Sticker } from "../stickers/entities/sticker.entity";
import { User } from "../users/entities/user.entity";
import { USER_IDS } from "./users.seed";

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

export async function seedCollections(
  users: User[],
  stickers: Sticker[]
): Promise<void> {
  const usersById = new Map(users.map((user) => [user.id, user]));
  const stickersById = new Map(
    stickers.map((sticker) => [sticker.number, sticker])
  );

  for (const item of COLLECTION_SEED_DATA) {
    const user = usersById.get(item.userId);
    if (!user) continue;

    const collection = await collectionRepository.initializeCollection(user.id);

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
  }
}

export function emptyCollectionForUser(user: User): Collection {
  const collection = new Collection();
  user.collection = collection;
  return collection;
}
