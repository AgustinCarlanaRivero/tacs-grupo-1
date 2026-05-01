import { notifications } from "../../notifications/services/notification.facade"

export type OfferRole = "sent" | "received" | "all"

export default class OfferService {
    static async getOffersByUser(_userId: string, _role: OfferRole) {
        return []
    }

    static async getOffersByPost(_postOwnerId: string, _postId: string) {
        return []
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
