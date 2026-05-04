import { notifications } from "../../notifications/services/notification.facade"
import {
    getStickerSearchValues,
    matchesAnyQuery,
    normalizeQuery,
    paginate,
} from "../../../shared/utils/query"

export type OfferRole = "sent" | "received" | "all"

type OfferListFilters = {
    query?: string
    page: number
    limit: number
}

type OfferUserFilters = OfferListFilters & {
    role: OfferRole
}

type OfferLike = {
    offerer?: { id?: string } | null
    offererId?: string
    postOwnerId?: string
    postId?: string
    post?: { id?: string; owner?: { id?: string } | null; ownerId?: string } | null
    offered?: Array<{ sticker?: unknown }>
}

function getOffererId(offer: OfferLike): string | undefined {
    return offer.offererId ?? offer.offerer?.id
}

function getPostOwnerId(offer: OfferLike): string | undefined {
    return offer.postOwnerId ?? offer.post?.owner?.id ?? offer.post?.ownerId
}

function getPostId(offer: OfferLike): string | undefined {
    return offer.postId ?? offer.post?.id
}

function matchesOfferRole(offer: OfferLike, userId: string, role: OfferRole): boolean {
    const isSent = getOffererId(offer) === userId
    const isReceived = getPostOwnerId(offer) === userId

    if (role === "sent") return isSent
    if (role === "received") return isReceived
    return isSent || isReceived
}

function matchesOfferQuery(offer: OfferLike, query?: string): boolean {
    if (!query) return true
    const offeredItems = offer.offered ?? []
    return offeredItems.some(item => matchesAnyQuery(getStickerSearchValues(item?.sticker as any), query))
}

export default class OfferService {
    static async getOffersByUser(userId: string, filters: OfferUserFilters) {
        const offers: OfferLike[] = []
        const normalizedQuery = normalizeQuery(filters.query)
        const filtered = offers.filter(offer => matchesOfferRole(offer, userId, filters.role))
            .filter(offer => matchesOfferQuery(offer, normalizedQuery))

        return paginate(filtered, filters.page, filters.limit)
    }

    static async getOffersByPost(postOwnerId: string, postId: string, filters: OfferListFilters) {
        const offers: OfferLike[] = []
        const normalizedQuery = normalizeQuery(filters.query)
        const filtered = offers
            .filter(offer => getPostOwnerId(offer) === postOwnerId && getPostId(offer) === postId)
            .filter(offer => matchesOfferQuery(offer, normalizedQuery))

        return paginate(filtered, filters.page, filters.limit)
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
    static async createOffer(postOwnerId: string, postId: string, offererId: string, _body: unknown) {
        const offerId = "TODO-real-offer-id"

        if (postOwnerId && postOwnerId !== offererId) {
            await notifications.offerReceived(postOwnerId, { offerId, postId, fromUserId: offererId })
        }

        return []
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
        _postOwnerId: string,
        _postId: string,
        _offerId: string,
        _state: unknown,
        _actorId: string,
    ) {
        // TODO(notifications): notifications.offerAccepted / offerRejected al offerer cuando state cambie.
        return []
    }
}
