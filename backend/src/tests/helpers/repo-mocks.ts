import { jest } from "@jest/globals";
import { createObjectIdString } from "../../infra/database/schema-helpers";
import type { Notification } from "../../modules/notifications/entities/notification.entity";
import type { OfferReadModel } from "../../modules/offers/repositories/offer.repository";
import type { Post } from "../../modules/posts/entities/post.entity";
import type { Rating } from "../../modules/ratings/entities/rating.entity";
import type { Sticker } from "../../modules/stickers/entities/sticker.entity";
import { Collection } from "../../modules/collection/entities/collection.entity";
import type { CollectionItem } from "../../modules/collection/entities/collection-item.interface";
import type { User } from "../../modules/users/entities/user.entity";

type Filter = Record<string, unknown>;

const getByPath = (obj: unknown, path: string): unknown => {
    return path.split(".").reduce<unknown>((acc, key) => {
        if (acc == null) return undefined;
        if (Array.isArray(acc)) {
            return acc
                .map((item) => (item as Record<string, unknown>)?.[key])
                .filter((v) => v !== undefined);
        }
        return (acc as Record<string, unknown>)[key];
    }, obj);
};

const matchValue = (actual: unknown, expected: unknown): boolean => {
    if (expected instanceof RegExp) {
        if (Array.isArray(actual)) {
            return actual.some((v) => typeof v === "string" && expected.test(v));
        }
        return typeof actual === "string" && expected.test(actual);
    }

    if (expected && typeof expected === "object") {
        const cond = expected as Filter;
        if ("$ne" in cond) {
            return Array.isArray(actual)
                ? !actual.includes(cond.$ne)
                : actual !== cond.$ne;
        }
        if ("$in" in cond && Array.isArray(cond.$in)) {
            const candidates = cond.$in as unknown[];
            if (Array.isArray(actual)) {
                return actual.some((v) => candidates.includes(v as never));
            }
            return candidates.includes(actual as never);
        }
    }

    if (Array.isArray(actual)) {
        return actual.includes(expected as never);
    }
    return actual === expected;
};

export const matchesFilter = (doc: unknown, filter: Filter): boolean => {
    for (const [key, value] of Object.entries(filter)) {
        if (key === "$or" && Array.isArray(value)) {
            if (!value.some((sub) => matchesFilter(doc, sub as Filter))) {
                return false;
            }
            continue;
        }
        if (key === "$and" && Array.isArray(value)) {
            if (!value.every((sub) => matchesFilter(doc, sub as Filter))) {
                return false;
            }
            continue;
        }
        const actual = getByPath(doc, key);
        if (!matchValue(actual, value)) return false;
    }
    return true;
};

const paginateList = <T>(items: T[], page: number, limit: number) => {
    const start = (page - 1) * limit;
    return {
        data: items.slice(start, start + limit),
        page,
        limit,
        total: items.length,
    };
};

// ---------- User ----------

export const buildUserRepoMock = () => {
    const store = new Map<string, User>();

    return {
        store,
        clear: jest.fn(async () => store.clear()),
        save: jest.fn(async (user: User) => {
            store.set(user.id, user);
            return user;
        }),
        findById: jest.fn(async (id: string) => store.get(id) ?? null),
        findByAuth0Sub: jest.fn(
            async (sub: string) =>
                Array.from(store.values()).find((u) => u.auth0Sub === sub) ??
                null,
        ),
        findByEmail: jest.fn(async (email: string) => {
            return (
                Array.from(store.values()).find((u) => u.email === email) ?? null
            );
        }),
        findByUsername: jest.fn(async (username: string) => {
            return (
                Array.from(store.values()).find((u) => u.username === username) ??
                null
            );
        }),
        findByTelegramChatId: jest.fn(async (chatId: string) => {
            return (
                Array.from(store.values()).find(
                    (u) => u.telegramChatId === chatId,
                ) ?? null
            );
        }),
        findAll: jest.fn(async () => Array.from(store.values())),
        findMany: jest.fn(async (filter: Filter = {}) =>
            Array.from(store.values()).filter((u) => matchesFilter(u, filter)),
        ),
        paginate: jest.fn(async (filter: Filter, opts: { page: number; limit: number }) => {
            const filtered = Array.from(store.values()).filter((u) =>
                matchesFilter(u, filter),
            );
            return paginateList(filtered, opts.page, opts.limit);
        }),
        delete: jest.fn(async (id: string) => store.delete(id)),
    };
};

// ---------- Post ----------

const postDocView = (post: Post) => ({
    _id: post.id,
    ownerId: post.owner.id,
    type: post.getType(),
    state: post.state,
    sticker: post.sticker,
});

export const buildPostRepoMock = () => {
    const store = new Map<string, Post>();
    let counter = 0;

    return {
        store,
        clear: jest.fn(async () => store.clear()),
        save: jest.fn(async (post: Post) => {
            if (!post.id) post.setId(`post-${++counter}`);
            store.set(post.id, post);
            return post;
        }),
        findById: jest.fn(async (id: string) => store.get(id) ?? null),
        findByIdWithOffers: jest.fn(async (id: string) => store.get(id) ?? null),
        findByOwnerId: jest.fn(async (ownerId: string) =>
            Array.from(store.values()).filter((p) => p.owner.id === ownerId),
        ),
        findAll: jest.fn(async () => Array.from(store.values())),
        paginate: jest.fn(async (filter: Filter, opts: { page: number; limit: number }) => {
            const filtered = Array.from(store.values()).filter((p) =>
                matchesFilter(postDocView(p), filter),
            );
            return paginateList(filtered, opts.page, opts.limit);
        }),
        delete: jest.fn(async (id: string) => store.delete(id)),
        deleteByPostId: jest.fn(async (_id: string) => 0),
    };
};

// ---------- Offer ----------

const offerDocView = (offer: OfferReadModel) => ({
    _id: offer.id,
    offererId: offer.offerer.id,
    postId: offer.postId,
    postOwnerId: offer.postOwnerId,
    state: offer.state,
    offered: offer.offered,
});

export const buildOfferRepoMock = () => {
    const store: OfferReadModel[] = [];

    return {
        store,
        clear: jest.fn(async () => {
            store.length = 0;
        }),
        save: jest.fn(async (offer: OfferReadModel) => {
            const idx = store.findIndex((o) => o.id === offer.id);
            if (idx >= 0) store[idx] = offer;
            else store.push(offer);
            return offer;
        }),
        findById: jest.fn(async (id: string) =>
            store.find((o) => o.id === id) ?? null,
        ),
        findByPostId: jest.fn(async (postId: string) =>
            store.filter((o) => o.postId === postId),
        ),
        findByUserId: jest.fn(async (userId: string) =>
            store.filter(
                (o) => o.offerer.id === userId || o.postOwnerId === userId,
            ),
        ),
        findAll: jest.fn(async () => [...store]),
        paginate: jest.fn(async (filter: Filter, opts: { page: number; limit: number }) => {
            const filtered = store.filter((o) => matchesFilter(offerDocView(o), filter));
            return paginateList(filtered, opts.page, opts.limit);
        }),
        delete: jest.fn(async (id: string) => {
            const i = store.findIndex((o) => o.id === id);
            if (i < 0) return false;
            store.splice(i, 1);
            return true;
        }),
        deleteByPostId: jest.fn(async (postId: string) => {
            const before = store.length;
            for (let i = store.length - 1; i >= 0; i--) {
                if (store[i].postId === postId) store.splice(i, 1);
            }
            return before - store.length;
        }),
    };
};

// ---------- Rating ----------

export const buildRatingRepoMock = () => {
    const store: Rating[] = [];
    let counter = 0;

    return {
        store,
        clear: jest.fn(async () => {
            store.length = 0;
        }),
        save: jest.fn(async (rating: Rating) => {
            if (!rating.id) rating.setId(`rating-${++counter}`);
            const idx = store.findIndex((r) => r.id === rating.id);
            if (idx >= 0) store[idx] = rating;
            else store.push(rating);
            return rating;
        }),
        findById: jest.fn(async (id: string) =>
            store.find((r) => r.id === id) ?? null,
        ),
        findByRevieweeId: jest.fn(async (revieweeId: string) =>
            store.filter((r) => r.reviewee.id === revieweeId),
        ),
        findByReviewerId: jest.fn(async (reviewerId: string) =>
            store.filter((r) => r.reviewer.id === reviewerId),
        ),
        findAll: jest.fn(async () => [...store]),
        paginate: jest.fn(async (filter: Filter, opts: { page: number; limit: number }) => {
            const filtered = store.filter((r) => {
                const view = {
                    revieweeId: r.reviewee.id,
                    reviewerId: r.reviewer.id,
                    comment: r.comment,
                };
                return matchesFilter(view, filter);
            });
            return paginateList(filtered, opts.page, opts.limit);
        }),
    };
};

// ---------- Notification ----------

export const buildNotificationRepoMock = () => {
    const store: Notification[] = [];

    return {
        store,
        clear: jest.fn(async () => {
            store.length = 0;
        }),
        save: jest.fn(async (notification: Notification) => {
            // Espejamos el repo real: si no tiene id, le asignamos un ObjectId.
            if (!notification.id) notification.setId(createObjectIdString());
            const idx = store.findIndex((n) => n.id === notification.id);
            if (idx >= 0) store[idx] = notification;
            else store.push(notification);
            return notification;
        }),
        findById: jest.fn(async (id: string) =>
            store.find((n) => n.id === id) ?? null,
        ),
        findByUserId: jest.fn(async (userId: string) =>
            store
                .filter((n) => n.userId === userId)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        ),
        findUnreadByUserId: jest.fn(async (userId: string) =>
            store
                .filter((n) => n.userId === userId && !n.read)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        ),
        countUnreadByUserId: jest.fn(async (userId: string) =>
            store.filter((n) => n.userId === userId && !n.read).length,
        ),
        countAll: jest.fn(async () => store.length),
        findAll: jest.fn(async () => [...store]),
    };
};

// ---------- Sticker ----------

export const buildStickerRepoMock = () => {
    const store = new Map<number, Sticker>();

    return {
        store,
        clear: jest.fn(() => store.clear()),
        save: jest.fn((sticker: Sticker) => {
            store.set(sticker.number, sticker);
        }),
        findAll: jest.fn(async () => Array.from(store.values())),
        findById: jest.fn(async (id: number) => store.get(id) ?? null),
        findByFilters: jest.fn(
            async (filters: {
                state?: string;
                type?: string;
                team?: string;
                club?: string;
            }) =>
                Array.from(store.values()).filter((s) => s.matchesFilters(filters)),
        ),
        getPlayers: jest.fn(async () =>
            Array.from(
                new Set(Array.from(store.values()).map((s) => s.player.name)),
            ).sort(),
        ),
        getTeams: jest.fn(async () =>
            Array.from(
                new Set(
                    Array.from(store.values())
                        .map((s) => s.player.nationalTeam?.name)
                        .filter((v): v is string => Boolean(v)),
                ),
            ).sort(),
        ),
        getClubs: jest.fn(async () =>
            Array.from(
                new Set(
                    Array.from(store.values())
                        .map((s) => s.player.club?.name)
                        .filter((v): v is string => Boolean(v)),
                ),
            ).sort(),
        ),
    };
};

// ---------- Collection ----------

export const buildCollectionRepoMock = () => {
    const store = new Map<string, Collection>();

    const getOrCreate = (userId: string): Collection => {
        const existing = store.get(userId);
        if (existing) return existing;
        const fresh = new Collection();
        store.set(userId, fresh);
        return fresh;
    };

    return {
        store,
        clear: jest.fn(async () => store.clear()),
        getCollection: jest.fn(async (userId: string) => store.get(userId) ?? null),
        addCollectionItem: jest.fn(async (userId: string, item: CollectionItem) => {
            const c = getOrCreate(userId);
            c.addItem(item);
            return c;
        }),
        updateCollectionItemQuantity: jest.fn(
            async (userId: string, stickerId: number, quantity: number) => {
                const c = store.get(userId);
                if (!c) return null;
                c.updateItemQuantity(stickerId, quantity);
                return c;
            },
        ),
        removeCollectionItem: jest.fn(
            async (userId: string, stickerId: number) => {
                const c = store.get(userId);
                if (!c) return null;
                c.removeItem(stickerId);
                return c;
            },
        ),
        addMissingSticker: jest.fn(async (userId: string, sticker: Sticker) => {
            const c = getOrCreate(userId);
            c.addMissing(sticker);
            return c;
        }),
        removeMissingSticker: jest.fn(
            async (userId: string, stickerId: number) => {
                const c = store.get(userId);
                if (!c) return null;
                c.removeMissing(stickerId);
                return c;
            },
        ),
        initializeCollection: jest.fn(async (userId: string) => getOrCreate(userId)),
    };
};

// ---------- Matching ----------

export const buildMatchingRepoMock = () => ({
    updateUserIndex: jest.fn(() => undefined),
    getUsersBySticker: jest.fn(async (_id: number) => [] as string[]),
    getUserMissingStickers: jest.fn(async (_id: string) => new Set<number>()),
    clear: jest.fn(() => undefined),
    getStats: jest.fn(() => ({ totalIndexedStickers: 0, totalIndexedUsers: 0 })),
});

// ---------- Notification facade (no-op spy) ----------

export const buildNotificationsFacadeMock = () => ({
    offerReceived: jest.fn(async () => undefined),
    offerAccepted: jest.fn(async () => undefined),
    offerRejected: jest.fn(async () => undefined),
    stickerAvailable: jest.fn(async () => undefined),
    auctionEnding: jest.fn(async () => undefined),
    ratingReceived: jest.fn(async () => undefined),
});
