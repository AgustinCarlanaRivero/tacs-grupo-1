import { Auction } from "../posts/entities/auction.entity";
import { DirectTrade } from "../posts/entities/direct-trade.entity";
import { Sticker } from "../stickers/entities/sticker.entity";
import { User } from "../users/entities/user.entity";
import postRepository from "../posts/repositories/post.repository";
import { USER_IDS } from "./users.seed";

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

export function seedPosts(users: User[], stickers: Sticker[]): void {
  const usersById = new Map(users.map((user) => [user.id, user]));
  const stickersById = new Map(stickers.map((sticker) => [sticker.number, sticker]));

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
    postRepository.save(post);
  }
}
