import { Types } from "mongoose";
import "../src/config/env";
import {
    connectMongo,
    disconnectMongo,
} from "../src/infra/database/connection";
import { Collection } from "../src/modules/collection/entities/collection.entity";
import { NotificationType } from "../src/modules/notifications/enums/notification-type.enum";
import { NotificationModel } from "../src/modules/notifications/schemas/notification.model";
import { OfferState } from "../src/modules/offers/enums/offer-state.enum";
import { OfferModel } from "../src/modules/offers/schemas/offer.model";
import { Auction } from "../src/modules/posts/entities/auction.entity";
import { DirectTrade } from "../src/modules/posts/entities/direct-trade.entity";
import { PostModel } from "../src/modules/posts/schemas/post.model";
import { RatingModel } from "../src/modules/ratings/schemas/rating.model";
import { Sticker } from "../src/modules/stickers/entities/sticker.entity";
import { User } from "../src/modules/users/entities/user.entity";
import { UserRole } from "../src/modules/users/enums/user-role.enum";
import { UserModel } from "../src/modules/users/schemas/user.model";

// ============ CONSTANTS ============

const objectId = (hex: string) => new Types.ObjectId(hex);
const toHex = (value: Types.ObjectId) => value.toHexString();

export const USER_IDS = {
    admin: objectId("665000000000000000000001"),
    ana: objectId("665000000000000000000002"),
    bruno: objectId("665000000000000000000003"),
    carla: objectId("665000000000000000000004"),
} as const;

const POST_IDS = {
    tradeAna7: objectId("665100000000000000000001"),
    auctionBruno11: objectId("665100000000000000000002"),
    tradeCarla9: objectId("665100000000000000000003"),
    auctionAna10: objectId("665100000000000000000004"),
    tradeBruno23: objectId("665100000000000000000005"),
    auctionCarla12: objectId("665100000000000000000006"),
    tradeAna8: objectId("665100000000000000000007"),
    auctionBruno9: objectId("665100000000000000000008"),
    tradeCarla11: objectId("665100000000000000000009"),
} as const;

const OFFER_IDS = {
    ana7Bruno: objectId("665200000000000000000001"),
    bruno11Carla: objectId("665200000000000000000002"),
    carla9Ana: objectId("665200000000000000000003"),
    ana10Bruno: objectId("665200000000000000000004"),
} as const;

const NOTIFICATION_IDS = {
    offerReceivedAna: objectId("665300000000000000000001"),
    offerAcceptedCarla: objectId("665300000000000000000002"),
    offerRejectedAna: objectId("665300000000000000000003"),
    stickerAvailableAna: objectId("665300000000000000000004"),
    auctionEndingBruno: objectId("665300000000000000000005"),
    ratingReceivedBruno: objectId("665300000000000000000006"),
} as const;

const RATING_IDS = {
    rating1: objectId("665400000000000000000001"),
    rating2: objectId("665400000000000000000002"),
    rating3: objectId("665400000000000000000003"),
} as const;

type SeedUserInput = {
    id: Types.ObjectId;
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
          id: Types.ObjectId;
          kind: "DIRECT_TRADE";
          ownerId: Types.ObjectId;
          stickerNumber: number;
      }
    | {
          id: Types.ObjectId;
          kind: "AUCTION";
          ownerId: Types.ObjectId;
          stickerNumber: number;
          minimumRequirement: number;
          endsInDays: number;
      };

export const POST_SEED_DATA: SeedPostInput[] = [
    {
        id: POST_IDS.tradeAna7,
        kind: "DIRECT_TRADE",
        ownerId: USER_IDS.ana,
        stickerNumber: 7,
    },
    {
        id: POST_IDS.auctionBruno11,
        kind: "AUCTION",
        ownerId: USER_IDS.bruno,
        stickerNumber: 11,
        minimumRequirement: 2,
        endsInDays: 10,
    },
    {
        id: POST_IDS.tradeCarla9,
        kind: "DIRECT_TRADE",
        ownerId: USER_IDS.carla,
        stickerNumber: 9,
    },
    {
        id: POST_IDS.auctionAna10,
        kind: "AUCTION",
        ownerId: USER_IDS.ana,
        stickerNumber: 10,
        minimumRequirement: 1,
        endsInDays: 7,
    },
    {
        id: POST_IDS.tradeBruno23,
        kind: "DIRECT_TRADE",
        ownerId: USER_IDS.bruno,
        stickerNumber: 23,
    },
    {
        id: POST_IDS.auctionCarla12,
        kind: "AUCTION",
        ownerId: USER_IDS.carla,
        stickerNumber: 12,
        minimumRequirement: 2,
        endsInDays: 5,
    },
    {
        id: POST_IDS.tradeAna8,
        kind: "DIRECT_TRADE",
        ownerId: USER_IDS.ana,
        stickerNumber: 8,
    },
    {
        id: POST_IDS.auctionBruno9,
        kind: "AUCTION",
        ownerId: USER_IDS.bruno,
        stickerNumber: 9,
        minimumRequirement: 3,
        endsInDays: 12,
    },
    {
        id: POST_IDS.tradeCarla11,
        kind: "DIRECT_TRADE",
        ownerId: USER_IDS.carla,
        stickerNumber: 11,
    },
];

type SeedCollectionInput = {
    userId: Types.ObjectId;
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

type SeedOfferInput = {
    id: Types.ObjectId;
    postId: Types.ObjectId;
    offererId: Types.ObjectId;
    offered: Array<{ stickerNumber: number; quantity: number }>;
    state?: OfferState;
    createdAt?: Date;
};

export const OFFER_SEED_DATA: SeedOfferInput[] = [
    {
        id: OFFER_IDS.ana7Bruno,
        postId: POST_IDS.tradeAna7,
        offererId: USER_IDS.bruno,
        offered: [{ stickerNumber: 11, quantity: 1 }],
        state: OfferState.PENDING,
    },
    {
        id: OFFER_IDS.bruno11Carla,
        postId: POST_IDS.auctionBruno11,
        offererId: USER_IDS.carla,
        offered: [{ stickerNumber: 12, quantity: 1 }],
        state: OfferState.APPROVED,
    },
    {
        id: OFFER_IDS.carla9Ana,
        postId: POST_IDS.tradeCarla9,
        offererId: USER_IDS.ana,
        offered: [
            { stickerNumber: 10, quantity: 1 },
            { stickerNumber: 23, quantity: 1 },
        ],
        state: OfferState.REJECTED,
    },
    {
        id: OFFER_IDS.ana10Bruno,
        postId: POST_IDS.auctionAna10,
        offererId: USER_IDS.bruno,
        offered: [{ stickerNumber: 9, quantity: 2 }],
        state: OfferState.PENDING,
    },
];

type SeedNotificationInput = {
    id: Types.ObjectId;
    userId: Types.ObjectId;
    type: NotificationType;
    message: string;
    payload: Record<string, unknown>;
    read?: boolean;
    createdAt?: Date;
};

export const NOTIFICATION_SEED_DATA: SeedNotificationInput[] = [
    {
        id: NOTIFICATION_IDS.offerReceivedAna,
        userId: USER_IDS.ana,
        type: NotificationType.OFFER_RECEIVED,
        message: "Recibiste una nueva propuesta de intercambio",
        payload: {
            offerId: OFFER_IDS.ana7Bruno,
            postId: POST_IDS.tradeAna7,
            fromUserId: USER_IDS.bruno,
        },
    },
    {
        id: NOTIFICATION_IDS.offerAcceptedCarla,
        userId: USER_IDS.carla,
        type: NotificationType.OFFER_ACCEPTED,
        message: "Tu propuesta fue aceptada",
        payload: {
            offerId: OFFER_IDS.bruno11Carla,
            postId: POST_IDS.auctionBruno11,
        },
    },
    {
        id: NOTIFICATION_IDS.offerRejectedAna,
        userId: USER_IDS.ana,
        type: NotificationType.OFFER_REJECTED,
        message: "Tu propuesta fue rechazada",
        payload: {
            offerId: OFFER_IDS.carla9Ana,
            postId: POST_IDS.tradeCarla9,
        },
        read: true,
    },
    {
        id: NOTIFICATION_IDS.stickerAvailableAna,
        userId: USER_IDS.ana,
        type: NotificationType.STICKER_AVAILABLE,
        message: "Aparecio una figurita que te falta",
        payload: {
            stickerId: "12",
            postId: POST_IDS.auctionCarla12,
        },
    },
    {
        id: NOTIFICATION_IDS.auctionEndingBruno,
        userId: USER_IDS.bruno,
        type: NotificationType.AUCTION_ENDING,
        message: "Una subasta que te interesa esta por terminar",
        payload: {
            postId: POST_IDS.auctionAna10,
            endsAt: new Date(
                Date.now() + 2 * 24 * 60 * 60 * 1000,
            ).toISOString(),
        },
    },
    {
        id: NOTIFICATION_IDS.ratingReceivedBruno,
        userId: USER_IDS.bruno,
        type: NotificationType.RATING_RECEIVED,
        message: "Recibiste una nueva calificacion",
        payload: {
            ratingId: RATING_IDS.rating1,
            fromUserId: USER_IDS.ana,
            score: 5,
        },
    },
];

type SeedRatingInput = {
    id: Types.ObjectId;
    reviewerId: Types.ObjectId;
    revieweeId: Types.ObjectId;
    score: number;
    comment?: string;
    createdAt?: Date;
};

export const RATING_SEED_DATA: SeedRatingInput[] = [
    {
        id: RATING_IDS.rating1,
        reviewerId: USER_IDS.ana,
        revieweeId: USER_IDS.bruno,
        score: 5,
        comment: "Intercambio impecable",
    },
    {
        id: RATING_IDS.rating2,
        reviewerId: USER_IDS.bruno,
        revieweeId: USER_IDS.carla,
        score: 4,
        comment: "Buen trato y rapido",
    },
    {
        id: RATING_IDS.rating3,
        reviewerId: USER_IDS.carla,
        revieweeId: USER_IDS.ana,
        score: 3,
        comment: "Podria mejorar la comunicacion",
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
            item.state,
            item.type,
            item.description ?? "",
        );
    });

    return stickers;
}

function toStickerPersistence(sticker: Sticker) {
    return {
        number: sticker.number,
        state: sticker.state,
        type: sticker.type,
        description: sticker.description ?? "",
        player: {
            name: sticker.player.name,
            nationalTeam: sticker.player.nationalTeam
                ? { name: sticker.player.nationalTeam.name }
                : undefined,
            club: sticker.player.club
                ? { name: sticker.player.club.name }
                : undefined,
            image: sticker.player.image,
        },
    };
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
                toHex(item.id),
            ),
    );

    for (let index = 0; index < users.length; index += 1) {
        const user = users[index];
        const userSeed = USER_SEED_DATA[index];
        if (!userSeed) continue;

        const userDoc = {
            _id: userSeed.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role,
            reputation: user.reputation,
            collection: null,
            auth0Sub: undefined,
        };

        await UserModel.findByIdAndUpdate(userSeed.id, userDoc, {
            upsert: true,
            new: true,
        });
    }

    console.log(`Seeded ${users.length} users`);
    return users;
}

async function seedPosts(users: User[], stickers: Sticker[]): Promise<void> {
    console.log("Seeding posts...");

    const usersById = new Map(users.map((user) => [user.id, user]));
    const stickersById = new Map(
        stickers.map((sticker) => [sticker.number, sticker]),
    );

    const posts = POST_SEED_DATA.flatMap((item) => {
        const owner = usersById.get(toHex(item.ownerId));
        const sticker = stickersById.get(item.stickerNumber);
        if (!owner || !sticker) return [];

        if (item.kind === "DIRECT_TRADE") {
            return [
                new DirectTrade(
                    owner,
                    sticker,
                    undefined,
                    [],
                    toHex(item.id),
                ),
            ];
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
                toHex(item.id),
            ),
        ];
    });

    for (const post of posts) {
        const postPersistence: Record<string, unknown> = {
            _id: new Types.ObjectId(post.id),
            type: post.getType(),
            state: post.state,
            ownerId: new Types.ObjectId(post.owner.id),
            sticker: post.sticker,
        };

        if (post instanceof Auction) {
            postPersistence.createdAt = post.createdAt;
            postPersistence.endsAt = post.endsAt;
            postPersistence.minimumRequirement = post.minimumRequirement;
        }

        await PostModel.findByIdAndUpdate(new Types.ObjectId(post.id), postPersistence, {
            upsert: true,
            new: true,
        });
    }

    console.log(`Seeded ${posts.length} posts`);
}

async function seedOffers(users: User[], stickers: Sticker[]): Promise<void> {
    console.log("Seeding offers...");

    const usersById = new Map(users.map((user) => [user.id, user]));
    const stickersById = new Map(
        stickers.map((sticker) => [sticker.number, sticker]),
    );
    const postOwnerById = new Map(
        POST_SEED_DATA.map((post) => [toHex(post.id), post.ownerId]),
    );

    let seeded = 0;

    for (const item of OFFER_SEED_DATA) {
        const postOwnerId = postOwnerById.get(toHex(item.postId));
        const offerer = usersById.get(toHex(item.offererId));
        if (!postOwnerId || !offerer) continue;

        const offered = item.offered.flatMap((entry) => {
            const sticker = stickersById.get(entry.stickerNumber);
            if (!sticker) return [];
            return [
                {
                    sticker: toStickerPersistence(sticker),
                    quantity: entry.quantity,
                },
            ];
        });

        if (offered.length === 0) continue;

        const offerDoc = {
            _id: item.id,
            state: item.state ?? OfferState.PENDING,
            createdAt: item.createdAt ?? new Date(),
            offererId: item.offererId,
            offered,
            postId: item.postId,
            postOwnerId,
        };

        await OfferModel.findByIdAndUpdate(item.id, offerDoc, {
            upsert: true,
            new: true,
        });

        seeded += 1;
    }

    console.log(`Seeded ${seeded} offers`);
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
        const user = usersById.get(toHex(item.userId));
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
            item.userId,
            { collection },
            { new: true },
        );
    }

    console.log(`Seeded collections for ${COLLECTION_SEED_DATA.length} users`);
}

async function seedNotifications(): Promise<void> {
    console.log("Seeding notifications...");

    let seeded = 0;
    for (const item of NOTIFICATION_SEED_DATA) {
        const notificationDoc = {
            _id: item.id,
            userId: item.userId,
            type: item.type,
            message: item.message,
            read: item.read ?? false,
            payload: item.payload ?? {},
            createdAt: item.createdAt ?? new Date(),
        };

        await NotificationModel.findByIdAndUpdate(item.id, notificationDoc, {
            upsert: true,
            new: true,
        });

        seeded += 1;
    }

    console.log(`Seeded ${seeded} notifications`);
}

async function seedRatings(): Promise<void> {
    console.log("Seeding ratings...");

    let seeded = 0;
    for (const item of RATING_SEED_DATA) {
        const ratingDoc = {
            _id: item.id,
            reviewerId: item.reviewerId,
            revieweeId: item.revieweeId,
            score: item.score,
            comment: item.comment ?? "",
            createdAt: item.createdAt ?? new Date(),
        };

        await RatingModel.findByIdAndUpdate(item.id, ratingDoc, {
            upsert: true,
            new: true,
        });

        seeded += 1;
    }

    console.log(`Seeded ${seeded} ratings`);
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

        if (shouldReset) {
            //Clear existing seed data
            console.log("Resetting seed data...");
            await UserModel.deleteMany({
                _id: { $in: USER_SEED_DATA.map((user) => user.id) },
            });
            await PostModel.deleteMany({
                _id: { $in: POST_SEED_DATA.map((post) => post.id) },
            });
            await OfferModel.deleteMany({
                _id: { $in: OFFER_SEED_DATA.map((offer) => offer.id) },
            });
            await NotificationModel.deleteMany({
                _id: {
                    $in: NOTIFICATION_SEED_DATA.map(
                        (notification) => notification.id,
                    ),
                },
            });
            await RatingModel.deleteMany({
                _id: { $in: RATING_SEED_DATA.map((rating) => rating.id) },
            });
            console.log("Seed data cleared\n");
        } else {
            // Run seeds
            const stickers = seedStickers();
            const users = await seedUsers();
            await seedCollections(users, stickers);
            await seedPosts(users, stickers);
            await seedOffers(users, stickers);
            await seedRatings();
            await seedNotifications();

            console.log("\nAll seeds completed successfully!\n");
        }

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
