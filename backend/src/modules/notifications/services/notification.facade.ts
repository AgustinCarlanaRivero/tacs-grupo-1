import notificationService from "./notification.service"
import { NotificationType } from "../enums/notification-type.enum"

/**
 * Facade de eventos de dominio del módulo de Notificaciones.
 *
 * Pensado para ser consumido desde el resto de los módulos (offers, posts,
 * ratings, matching, etc.) sin que tengan que conocer el enum de tipos ni
 * armar el copy del mensaje. Cada método representa un evento de negocio:
 * pasale el id del usuario destinatario y el contexto mínimo, y el facade se
 * encarga del resto (persistencia + entrega por todos los canales).
 *
 * Todos los métodos son fire-and-forget desde el punto de vista del llamador,
 * pero devuelven una promesa para poder testearlos / loguear errores.
 */
export const notifications = {
    /**
     * Disparar cuando un usuario recibe una nueva oferta sobre una de sus publicaciones.
     */
    offerReceived(toUserId: string, ctx: { offerId: string; postId: string; fromUserId: string }) {
        return notificationService.notify(
            toUserId,
            NotificationType.OFFER_RECEIVED,
            "Recibiste una nueva propuesta de intercambio",
            ctx,
        )
    },

    /**
     * Disparar cuando el dueño de la publicación acepta la oferta de otro usuario.
     * El destinatario es quien hizo la oferta.
     */
    offerAccepted(toUserId: string, ctx: { offerId: string; postId: string }) {
        return notificationService.notify(
            toUserId,
            NotificationType.OFFER_ACCEPTED,
            "Tu propuesta fue aceptada",
            ctx,
        )
    },

    /**
     * Disparar cuando el dueño de la publicación rechaza la oferta. Destinatario: el offerer.
     */
    offerRejected(toUserId: string, ctx: { offerId: string; postId: string }) {
        return notificationService.notify(
            toUserId,
            NotificationType.OFFER_REJECTED,
            "Tu propuesta fue rechazada",
            ctx,
        )
    },

    /**
     * Disparar cuando aparece disponible una figurita que el usuario tiene marcada como faltante.
     * Típicamente lo invoca el módulo de matching/posts al crear una nueva publicación.
     */
    stickerAvailable(toUserId: string, ctx: { stickerId: string; postId: string }) {
        return notificationService.notify(
            toUserId,
            NotificationType.STICKER_AVAILABLE,
            "Apareció una figurita que te falta",
            ctx,
        )
    },

    /**
     * Disparar cuando una subasta de interés del usuario está por terminar.
     * Lo dispara un job/scheduler del módulo de subastas.
     */
    auctionEnding(toUserId: string, ctx: { postId: string; endsAt: Date | string }) {
        return notificationService.notify(
            toUserId,
            NotificationType.AUCTION_ENDING,
            "Una subasta que te interesa está por terminar",
            { ...ctx, endsAt: ctx.endsAt instanceof Date ? ctx.endsAt.toISOString() : ctx.endsAt },
        )
    },

    /**
     * Disparar cuando un usuario recibe una nueva calificación.
     */
    ratingReceived(toUserId: string, ctx: { ratingId: string; fromUserId: string; score: number }) {
        return notificationService.notify(
            toUserId,
            NotificationType.RATING_RECEIVED,
            "Recibiste una nueva calificación",
            ctx,
        )
    },
}

export type NotificationsFacade = typeof notifications
