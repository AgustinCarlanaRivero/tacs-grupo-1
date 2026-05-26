import {
    BadRequestError,
    NotFoundError,
} from "../../../shared/errors/http-errors";
import {
    getStickerSearchValues,
    matchesAnyQuery,
    normalizeQuery,
    paginate,
} from "../../../shared/utils/query";
import collectionRepository from "../../collection/repositories/collection.repository";
import { notifications } from "../../notifications/services/notification.facade";
import offerRepository from "../../offers/repositories/offer.repository";
import { Sticker } from "../../stickers/entities/sticker.entity";
import { stickerResponseSchema } from "../../stickers/schemas/sticker.schemas";
import StickerService from "../../stickers/services/sticker.service";
import type { User } from "../../users/entities/user.entity";
import userRepository from "../../users/repositories/user.repository";
import { Auction } from "../entities/auction.entity";
import { Post } from "../entities/post.entity";
import { PostState } from "../enums/post-state.enum";
import { PostType } from "../enums/post-type.enum";
import postRepository from "../repositories/post.repository";
import { postResponseSchema } from "../schemas/post.schemas";
import AuctionService from "./auction.service";
import TradeService from "./trade.service";

type PostListFilters = {
    type?: PostType;
    state?: PostState;
    query?: string;
    page: number;
    limit: number;
};

type PostCreatePayload = {
    type: PostType;
    stickerId: number;
    endsAt?: string;
    minimumRequirement?: number;
};

function matchesPostQuery(post: Post, query?: string): boolean {
    if (!query) return true;
    return matchesAnyQuery(getStickerSearchValues(post.sticker), query);
}

function buildPostQueryFilter(filters: PostListFilters) {
    const normalizedQuery = normalizeQuery(filters.query);
    const filter: Record<string, unknown> = {};

    if (filters.type) filter.type = filters.type;
    if (filters.state) filter.state = filters.state;

    if (normalizedQuery) {
        const regex = new RegExp(normalizedQuery, "i");
        const orFilters: Record<string, unknown>[] = [
            { "sticker.description": regex },
            { "sticker.player.name": regex },
            { "sticker.player.nationalTeam.name": regex },
            { "sticker.player.club.name": regex },
        ];
        const numericQuery = Number(normalizedQuery);
        if (!Number.isNaN(numericQuery)) {
            orFilters.push({ "sticker.number": numericQuery });
        }
        filter.$or = orFilters;
    }

    return filter;
}

function toStickerResponse(sticker: Sticker) {
    return stickerResponseSchema.parse({
        number: sticker.number,
        title:
            sticker.getDisplayName?.() ??
            `#${sticker.number} ${sticker.player.name}`,
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
    });
}

function toPostResponse(post: Post) {
    const base = {
        id: post.id ?? "",
        type: post.getType(),
        state: post.state,
        sticker: toStickerResponse(post.sticker),
        owner: {
            id: post.owner.id,
            username: post.owner.username,
        },
    };

    if (post instanceof Auction) {
        return postResponseSchema.parse({
            ...base,
            createdAt: post.createdAt,
            endsAt: post.endsAt,
            minimumRequirement: post.minimumRequirement,
        });
    }

    return postResponseSchema.parse(base);
}

export default class PostService {
    static async listPosts(filters: PostListFilters) {
        const repo = postRepository as typeof postRepository & {
            paginate?: (
                filter: Record<string, unknown>,
                options: { page: number; limit: number }
            ) => Promise<{
                data: Post[];
                total: number;
                page: number;
                limit: number;
            }>;
        };

        if (repo.paginate) {
            const filter = buildPostQueryFilter(filters);
            const result = await repo.paginate(filter, {
                page: filters.page,
                limit: filters.limit,
            });
            return {
                data: result.data.map(toPostResponse),
                total: result.total,
                page: result.page,
                limit: result.limit,
            };
        }

        const posts = await postRepository.findAll();
        return this.applyFilters(posts, filters);
    }

    static async createPost(ownerId: string, body: PostCreatePayload) {
        const owner = await userRepository.findById(ownerId);
        if (!owner) {
            throw new NotFoundError("Usuario no encontrado");
        }

        const sticker = await StickerService.getStickerByNumberOrFail(
            String(body.stickerId)
        );
        let post: Post;

        if (body.type === PostType.AUCTION) {
            if (!body.endsAt) {
                throw new BadRequestError("endsAt es requerido para subastas");
            }

            const endsAt = new Date(body.endsAt);
            if (Number.isNaN(endsAt.getTime())) {
                throw new BadRequestError("endsAt debe ser una fecha valida");
            }

            if (endsAt.getTime() <= Date.now()) {
                throw new BadRequestError("endsAt debe ser una fecha futura");
            }

            const minimumRequirement = body.minimumRequirement ?? 1;
            if (minimumRequirement < 1) {
                throw new BadRequestError(
                    "minimumRequirement debe ser mayor o igual a 1"
                );
            }

            post = AuctionService.createAuction(
                owner,
                sticker,
                endsAt,
                minimumRequirement
            );
        } else {
            post = TradeService.createTrade(owner, sticker);
        }

        await postRepository.save(post);
        await this.notifyMissingUsers(sticker, post.id ?? "", ownerId);

        return toPostResponse(post);
    }

    static async getPostById(ownerId: string, postId: string) {
        const post = await postRepository.findById(postId);
        if (!post || post.owner.id !== ownerId) {
            throw new NotFoundError("Publicacion no encontrada");
        }
        return toPostResponse(post);
    }

    static async updatePostState(
        ownerId: string,
        postId: string,
        state: PostState
    ) {
        const post = await postRepository.findById(postId);
        if (!post || post.owner.id !== ownerId) {
            throw new NotFoundError("Publicacion no encontrada");
        }

        post.changeState(state);
        await postRepository.save(post);
        return toPostResponse(post);
    }

    static async deletePost(ownerId: string, postId: string) {
        const post = await postRepository.findById(postId);
        if (!post || post.owner.id !== ownerId) {
            throw new NotFoundError("Publicacion no encontrada");
        }

        await postRepository.delete(postId);
        await offerRepository.deleteByPostId(postId);
    }

    static async listPostsByOwner(userId: string, filters: PostListFilters) {
        const repo = postRepository as typeof postRepository & {
            paginate?: (
                filter: Record<string, unknown>,
                options: { page: number; limit: number }
            ) => Promise<{
                data: Post[];
                total: number;
                page: number;
                limit: number;
            }>;
        };

        if (repo.paginate) {
            const filter = buildPostQueryFilter(filters);
            filter.ownerId = userId;
            const result = await repo.paginate(filter, {
                page: filters.page,
                limit: filters.limit,
            });
            return {
                data: result.data.map(toPostResponse),
                total: result.total,
                page: result.page,
                limit: result.limit,
            };
        }

        const posts = await postRepository.findByOwnerId(userId);
        return this.applyFilters(posts, filters);
    }

    private static async notifyMissingUsers(
        sticker: Sticker,
        postId: string,
        ownerId: string
    ) {
        const repo = userRepository as typeof userRepository & {
            findMany?: (filter: Record<string, unknown>) => Promise<User[]>;
        };

        const users = repo.findMany
            ? await repo.findMany({
                  _id: { $ne: ownerId },
                  "collection.missingStickers.number": sticker.number,
              })
            : await userRepository.findAll();

        await Promise.all(
            users.map(async (user) => {
                if (user.id === ownerId) return;
                const collection = await collectionRepository.getCollection(
                    user.id
                );
                if (collection && collection.isMissing(sticker.number)) {
                    await notifications.stickerAvailable(user.id, {
                        stickerId: String(sticker.number),
                        postId,
                    });
                }
            })
        );
    }

    private static applyFilters(posts: Post[], filters: PostListFilters) {
        const normalizedQuery = normalizeQuery(filters.query);
        const filtered = posts.filter((post) => {
            if (filters.type && post.getType() !== filters.type) return false;
            if (filters.state && post.state !== filters.state) return false;
            return matchesPostQuery(post, normalizedQuery);
        });

        const data = filtered.map(toPostResponse);
        return paginate(data, filters.page, filters.limit);
    }
}
