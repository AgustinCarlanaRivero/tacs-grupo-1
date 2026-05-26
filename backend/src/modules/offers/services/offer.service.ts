import { createObjectIdString } from "../../../infra/database/schema-helpers";
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
import { CollectionItem } from "../../collection/entities/collection-item.interface";
import collectionRepository from "../../collection/repositories/collection.repository";
import { notifications } from "../../notifications/services/notification.facade";
import type { Post } from "../../posts/entities/post.entity";
import postRepository from "../../posts/repositories/post.repository";
import { Sticker } from "../../stickers/entities/sticker.entity";
import { stickerResponseSchema } from "../../stickers/schemas/sticker.schemas";
import userRepository from "../../users/repositories/user.repository";
import { Offer } from "../entities/offer.entity";
import { OfferState } from "../enums/offer-state.enum";
import offerRepository, {
    type OfferReadModel,
} from "../repositories/offer.repository";
import { offerResponseSchema } from "../schemas/offer.schemas";

export type OfferRole = "sent" | "received" | "all";

type OfferListFilters = {
    query?: string;
    page: number;
    limit: number;
};

type OfferUserFilters = OfferListFilters & {
    role: OfferRole;
};

type OfferCreatePayload = {
    offered: Array<{ stickerId: number; quantity?: number }>;
};

function getOffererId(offer: Offer): string | undefined {
    return offer.offerer.id;
}

function matchesOfferRole(
    offer: OfferReadModel,
    userId: string,
    role: OfferRole
): boolean {
    const isSent = getOffererId(offer) === userId;
    const isReceived = offer.postOwnerId === userId;

    if (role === "sent") return isSent;
    if (role === "received") return isReceived;
    return isSent || isReceived;
}

function matchesOfferQuery(offer: Offer, query?: string): boolean {
    if (!query) return true;
    const offeredItems = offer.offered ?? [];
    return offeredItems.some((item) =>
        matchesAnyQuery(getStickerSearchValues(item?.sticker), query)
    );
}

function buildOfferQueryFilter(query?: string) {
    if (!query) return null;
    const regex = new RegExp(query, "i");
    const orFilters: Record<string, unknown>[] = [
        { "offered.sticker.description": regex },
        { "offered.sticker.player.name": regex },
        { "offered.sticker.player.nationalTeam.name": regex },
        { "offered.sticker.player.club.name": regex },
    ];
    const numericQuery = Number(query);
    if (!Number.isNaN(numericQuery)) {
        orFilters.push({ "offered.sticker.number": numericQuery });
    }
    return { $or: orFilters } as Record<string, unknown>;
}

async function loadPostForOffers(postId: string): Promise<Post | null> {
    const repo = postRepository as typeof postRepository & {
        findByIdWithOffers?: (id: string) => Promise<Post | null>;
    };
    if (repo.findByIdWithOffers) {
        return repo.findByIdWithOffers(postId);
    }
    return postRepository.findById(postId);
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

function toOfferResponse(offer: OfferReadModel) {
    return offerResponseSchema.parse({
        id: offer.id ?? "",
        state: offer.state,
        createdAt: offer.createdAt,
        offerer: {
            id: offer.offerer.id,
            username: offer.offerer.username,
        },
        offered: offer.offered.map((item: CollectionItem) => ({
            sticker: toStickerResponse(item.sticker),
            quantity: item.quantity,
        })),
        postId: offer.postId,
        postOwnerId: offer.postOwnerId,
    });
}

export default class OfferService {
    static async getOffersByUser(userId: string, filters: OfferUserFilters) {
        const normalizedQuery = normalizeQuery(filters.query);
        const repo = offerRepository as typeof offerRepository & {
            paginate?: (
                filter: Record<string, unknown>,
                options: { page: number; limit: number }
            ) => Promise<{
                data: OfferReadModel[];
                total: number;
                page: number;
                limit: number;
            }>;
        };

        if (repo.paginate) {
            const roleFilter: Record<string, unknown> =
                filters.role === "sent"
                    ? { offererId: userId }
                    : filters.role === "received"
                    ? { postOwnerId: userId }
                    : {
                          $or: [{ offererId: userId }, { postOwnerId: userId }],
                      };
            const queryFilter = buildOfferQueryFilter(
                normalizedQuery ?? undefined
            );
            const filter = queryFilter
                ? { $and: [roleFilter, queryFilter] }
                : roleFilter;

            const result = await repo.paginate(filter, {
                page: filters.page,
                limit: filters.limit,
            });
            return {
                data: result.data.map(toOfferResponse),
                total: result.total,
                page: result.page,
                limit: result.limit,
            };
        }

        const offers = await offerRepository.findByUserId(userId);
        const filtered = offers
            .filter((offer) => matchesOfferRole(offer, userId, filters.role))
            .filter((offer) => matchesOfferQuery(offer, normalizedQuery));

        const data = filtered.map((offer) => toOfferResponse(offer));
        return paginate(data, filters.page, filters.limit);
    }

    static async getOffersByPost(
        postOwnerId: string,
        postId: string,
        filters: OfferListFilters
    ) {
        const post = await postRepository.findById(postId);
        if (!post || post.owner.id !== postOwnerId) {
            throw new NotFoundError("Publicacion no encontrada");
        }

        const normalizedQuery = normalizeQuery(filters.query);
        const repo = offerRepository as typeof offerRepository & {
            paginate?: (
                filter: Record<string, unknown>,
                options: { page: number; limit: number }
            ) => Promise<{
                data: OfferReadModel[];
                total: number;
                page: number;
                limit: number;
            }>;
        };

        if (repo.paginate) {
            const baseFilter: Record<string, unknown> = {
                postId,
                postOwnerId,
            };
            const queryFilter = buildOfferQueryFilter(
                normalizedQuery ?? undefined
            );
            const filter = queryFilter
                ? { $and: [baseFilter, queryFilter] }
                : baseFilter;

            const result = await repo.paginate(filter, {
                page: filters.page,
                limit: filters.limit,
            });
            return {
                data: result.data.map(toOfferResponse),
                total: result.total,
                page: result.page,
                limit: result.limit,
            };
        }

        const offers = await offerRepository.findByPostId(postId);
        const filtered = offers
            .filter((offer) => offer.postOwnerId === postOwnerId)
            .filter((offer) => matchesOfferQuery(offer, normalizedQuery));

        const data = filtered.map((offer) => toOfferResponse(offer));
        return paginate(data, filters.page, filters.limit);
    }

    static async createOffer(
        postOwnerId: string,
        postId: string,
        offererId: string,
        body: OfferCreatePayload
    ) {
        const post = await loadPostForOffers(postId);
        if (!post || post.owner.id !== postOwnerId) {
            throw new NotFoundError("Publicacion no encontrada");
        }

        const offerer = await userRepository.findById(offererId);
        if (!offerer) {
            throw new NotFoundError("Usuario oferente no encontrado");
        }

        const collection = await collectionRepository.getCollection(offererId);
        if (!collection) {
            throw new BadRequestError("El usuario no tiene coleccion cargada");
        }

        const offeredPayload = body.offered ?? [];
        if (offeredPayload.length === 0) {
            throw new BadRequestError("Debe ofrecer al menos una figurita");
        }

        const offeredItems = offeredPayload.map((item) => {
            const existing = collection.getItemByStickerId(item.stickerId);
            if (!existing) {
                throw new BadRequestError(
                    "El usuario no posee la figurita ofrecida"
                );
            }

            const quantity = item.quantity ?? 1;
            if (quantity <= 0) {
                throw new BadRequestError(
                    "La cantidad ofrecida debe ser positiva"
                );
            }

            if (quantity > existing.quantity) {
                throw new BadRequestError(
                    "Cantidad ofrecida supera la disponible en coleccion"
                );
            }

            return { sticker: existing.sticker, quantity };
        });

        const offer = new Offer(offerer, offeredItems);
        offer.setId(createObjectIdString());

        post.addOffer(offer);
        await postRepository.save(post);
        const stored = Object.assign(offer, {
            postId,
            postOwnerId: post.owner.id,
        });
        await offerRepository.save(stored);

        if (postOwnerId && postOwnerId !== offererId) {
            await notifications.offerReceived(postOwnerId, {
                offerId: offer.id ?? "",
                postId,
                fromUserId: offererId,
            });
        }

        return toOfferResponse(stored);
    }

    static async updateOfferState(
        postOwnerId: string,
        postId: string,
        offerId: string,
        state: OfferState,
        actorId: string
    ) {
        const post = await loadPostForOffers(postId);
        if (!post || post.owner.id !== postOwnerId) {
            throw new NotFoundError("Publicacion no encontrada");
        }

        const actor = await userRepository.findById(actorId);
        if (!actor) {
            throw new NotFoundError("Usuario actor no encontrado");
        }

        let updated: Offer;
        if (state === OfferState.APPROVED) {
            updated = post.approveOffer(offerId, actor);
        } else if (state === OfferState.REJECTED) {
            updated = post.rejectOffer(offerId, actor);
        } else if (state === OfferState.CANCELLED) {
            updated = post.cancelOffer(offerId, actor);
        } else {
            throw new BadRequestError("Estado de oferta invalido");
        }

        await postRepository.save(post);
        const stored = Object.assign(updated, {
            postId,
            postOwnerId: post.owner.id,
        });
        await offerRepository.save(stored);

        if (state === OfferState.APPROVED) {
            await notifications.offerAccepted(updated.offerer.id, {
                offerId,
                postId,
            });
        }

        if (state === OfferState.REJECTED) {
            await notifications.offerRejected(updated.offerer.id, {
                offerId,
                postId,
            });
        }

        return toOfferResponse(stored);
    }
}
