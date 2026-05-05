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
import authRepository from "../../auth/repositories/auth.repository";
import { CollectionItem } from "../../collection/entities/collection-item.interface";
import collectionRepository from "../../collection/repositories/collection.repository";
import { notifications } from "../../notifications/services/notification.facade";
import postRepository from "../../posts/repositories/post.repository";
import { Sticker } from "../../stickers/entities/sticker.entity";
import { stickerResponseSchema } from "../../stickers/schemas/sticker.schemas";
import { Offer } from "../entities/offer.entity";
import { OfferState } from "../enums/offer-state.enum";
import offerRepository, {
    type OfferRecord,
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
    record: OfferRecord,
    userId: string,
    role: OfferRole,
): boolean {
    const isSent = getOffererId(record.offer) === userId;
    const isReceived = record.postOwnerId === userId;

    if (role === "sent") return isSent;
    if (role === "received") return isReceived;
    return isSent || isReceived;
}

function matchesOfferQuery(offer: Offer, query?: string): boolean {
    if (!query) return true;
    const offeredItems = offer.offered ?? [];
    return offeredItems.some((item) =>
        matchesAnyQuery(getStickerSearchValues(item?.sticker), query),
    );
}

function toStickerResponse(sticker: Sticker) {
    return stickerResponseSchema.parse({
        id: sticker.number,
        title:
            sticker.getDisplayName?.() ??
            `#${sticker.number} ${sticker.player.name}`,
        state: sticker.category.state,
        type: sticker.category.type,
        description: sticker.description ?? "",
        player: {
            name: sticker.player.name,
            nationalTeam: sticker.player.nationalTeam?.name,
            club: sticker.player.club?.name,
            image: sticker.player.image,
        },
    });
}

function toOfferResponse(offer: Offer) {
    return offerResponseSchema.parse({
        id: offer.id ?? "",
        state: offer.state,
        createdAt: offer.createdAt.toISOString(),
        offerer: {
            id: offer.offerer.id,
            username: offer.offerer.username,
        },
        offered: offer.offered.map((item: CollectionItem) => ({
            sticker: toStickerResponse(item.sticker),
            quantity: item.quantity,
        })),
    });
}

export default class OfferService {
    static async getOffersByUser(userId: string, filters: OfferUserFilters) {
        const offers = offerRepository.findByUserId(userId);
        const normalizedQuery = normalizeQuery(filters.query);
        const filtered = offers
            .filter((offer) => matchesOfferRole(offer, userId, filters.role))
            .filter((offer) => matchesOfferQuery(offer.offer, normalizedQuery));

        const data = filtered.map((record) => toOfferResponse(record.offer));
        return paginate(data, filters.page, filters.limit);
    }

    static async getOffersByPost(
        postOwnerId: string,
        postId: string,
        filters: OfferListFilters,
    ) {
        const post = postRepository.findById(postId);
        if (!post || post.owner.id !== postOwnerId) {
            throw new NotFoundError("Publicacion no encontrada");
        }

        const offers = offerRepository.findByPostId(postId);
        const normalizedQuery = normalizeQuery(filters.query);
        const filtered = offers
            .filter((offer) => offer.postOwnerId === postOwnerId)
            .filter((offer) => matchesOfferQuery(offer.offer, normalizedQuery));

        const data = filtered.map((record) => toOfferResponse(record.offer));
        return paginate(data, filters.page, filters.limit);
    }

    /**
     * STUB — devuelve `[]` hasta que se implemente la lógica real.
     *
     * NOTA PARA EL DUEÑO DE OFFERS:
     * Cuando implementes la creación real, **mantené la llamada al facade de
     * notificaciones después de persistir la oferta**. El destinatario es el
     * dueño de la publicación (`postOwnerId`). El payload (`offerId`) deberá
     * apuntar al id real de la oferta recién creada.
     * Ver `modules/notifications/README.md`.
     */
    static async createOffer(
        postOwnerId: string,
        postId: string,
        offererId: string,
        body: OfferCreatePayload,
    ) {
        const post = postRepository.findById(postId);
        if (!post || post.owner.id !== postOwnerId) {
            throw new NotFoundError("Publicacion no encontrada");
        }

        const offerer = authRepository.findById(offererId);
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
                    "El usuario no posee la figurita ofrecida",
                );
            }

            const quantity = item.quantity ?? 1;
            if (quantity <= 0) {
                throw new BadRequestError(
                    "La cantidad ofrecida debe ser positiva",
                );
            }

            if (quantity > existing.quantity) {
                throw new BadRequestError(
                    "Cantidad ofrecida supera la disponible en coleccion",
                );
            }

            return { sticker: existing.sticker, quantity };
        });

        const offer = new Offer(offerer, offeredItems);
        offer.setId(crypto.randomUUID());

        post.addOffer(offer);
        postRepository.save(post);
        offerRepository.save({ offer, postId, postOwnerId: post.owner.id });

        if (postOwnerId && postOwnerId !== offererId) {
            await notifications.offerReceived(postOwnerId, {
                offerId: offer.id ?? "",
                postId,
                fromUserId: offererId,
            });
        }

        return toOfferResponse(offer);
    }

    /**
     * STUB — devuelve `[]` hasta que se implemente la lógica real.
     *
     * NOTA PARA EL DUEÑO DE OFFERS:
     * Cuando tengas la oferta persistida, conocé el `offererId` (el destinatario
     * de la notificación) y según el `state` final llamá a:
     *   - `notifications.offerAccepted(offererId, { offerId, postId })`
     *   - `notifications.offerRejected(offererId, { offerId, postId })`
     * Hoy sólo dejo logueado el TODO porque el stub no tiene acceso al offererId.
     */
    static async updateOfferState(
        postOwnerId: string,
        postId: string,
        offerId: string,
        state: OfferState,
        actorId: string,
    ) {
        const post = postRepository.findById(postId);
        if (!post || post.owner.id !== postOwnerId) {
            throw new NotFoundError("Publicacion no encontrada");
        }

        const actor = authRepository.findById(actorId);
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

        postRepository.save(post);
        offerRepository.save({
            offer: updated,
            postId,
            postOwnerId: post.owner.id,
        });

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

        return toOfferResponse(updated);
    }
}
