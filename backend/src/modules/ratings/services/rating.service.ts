import { notifications } from "../../notifications/services/notification.facade"

export default class RatingService {
    static async getRatingsByUser(_revieweeId: string) {
        return []
    }

    /**
     * STUB — devuelve `[]` hasta que se implemente la lógica real.
     *
     * NOTA PARA EL DUEÑO DE RATINGS:
     * Cuando persistas el rating real, mantené la llamada al facade después de
     * guardar — el destinatario es el `revieweeId`. Hay que pasarle el id del
     * rating recién creado y el score real (acá uso 0 como placeholder).
     * Ver `modules/notifications/README.md`.
     */
    static async createRating(revieweeId: string, reviewerId: string, _body: unknown) {
        const ratingId = "TODO-real-rating-id"
        const score = 0 // TODO(ratings): tomar el score real del body validado.

        if (revieweeId && revieweeId !== reviewerId) {
            await notifications.ratingReceived(revieweeId, { ratingId, fromUserId: reviewerId, score })
        }

        return []
    }
}
