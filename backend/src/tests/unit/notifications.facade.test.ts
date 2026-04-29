import { describe, it, expect, beforeEach } from "@jest/globals"
import { notifications } from "../../modules/notifications/services/notification.facade"
import notificationRepository from "../../modules/notifications/repositories/notification.repository"
import { NotificationType } from "../../modules/notifications/enums/notification-type.enum"
import OfferService from "../../modules/offers/services/offer.service"
import RatingService from "../../modules/ratings/services/rating.service"

describe("notifications facade", () => {
    beforeEach(() => {
        notificationRepository.clear()
    })

    it("offerReceived persiste una notificación con el tipo y payload correctos", async () => {
        await notifications.offerReceived("owner-1", {
            offerId: "of-1",
            postId: "p-1",
            fromUserId: "buyer-1",
        })

        const stored = notificationRepository.findByUserId("owner-1")
        expect(stored).toHaveLength(1)
        expect(stored[0].type).toBe(NotificationType.OFFER_RECEIVED)
        expect(stored[0].payload).toEqual({ offerId: "of-1", postId: "p-1", fromUserId: "buyer-1" })
    })

    it("auctionEnding serializa la fecha endsAt", async () => {
        const endsAt = new Date("2026-12-31T23:59:59Z")
        await notifications.auctionEnding("u", { postId: "p", endsAt })

        const stored = notificationRepository.findByUserId("u")
        expect(stored[0].payload.endsAt).toBe(endsAt.toISOString())
    })

    it("ratingReceived guarda score y reviewer", async () => {
        await notifications.ratingReceived("u", { ratingId: "r", fromUserId: "rev", score: 4 })
        const [n] = notificationRepository.findByUserId("u")
        expect(n.type).toBe(NotificationType.RATING_RECEIVED)
        expect(n.payload).toEqual({ ratingId: "r", fromUserId: "rev", score: 4 })
    })
})

describe("integración: stubs de otros módulos disparan el facade", () => {
    beforeEach(() => {
        notificationRepository.clear()
    })

    it("OfferService.createOffer notifica al postOwner cuando es distinto del offerer", async () => {
        await OfferService.createOffer("owner-1", "post-1", "buyer-1", {})
        const stored = notificationRepository.findByUserId("owner-1")
        expect(stored).toHaveLength(1)
        expect(stored[0].type).toBe(NotificationType.OFFER_RECEIVED)
    })

    it("OfferService.createOffer no notifica si el offerer es el propio dueño del post", async () => {
        await OfferService.createOffer("owner-1", "post-1", "owner-1", {})
        expect(notificationRepository.findByUserId("owner-1")).toHaveLength(0)
    })

    it("RatingService.createRating notifica al reviewee", async () => {
        await RatingService.createRating("reviewee-1", "reviewer-1", { score: 5 })
        const stored = notificationRepository.findByUserId("reviewee-1")
        expect(stored).toHaveLength(1)
        expect(stored[0].type).toBe(NotificationType.RATING_RECEIVED)
    })

    it("RatingService.createRating no notifica si reviewee === reviewer", async () => {
        await RatingService.createRating("u", "u", { score: 5 })
        expect(notificationRepository.findByUserId("u")).toHaveLength(0)
    })
})
