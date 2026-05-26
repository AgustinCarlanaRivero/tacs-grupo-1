import { beforeEach, describe, expect, it } from "@jest/globals";
import AuthService from "../../modules/auth/services/auth.service";
import collectionRepository from "../../modules/collection/repositories/collection.repository";
import { NotificationType } from "../../modules/notifications/enums/notification-type.enum";
import notificationRepository from "../../modules/notifications/repositories/notification.repository";
import { notifications } from "../../modules/notifications/services/notification.facade";
import offerRepository from "../../modules/offers/repositories/offer.repository";
import OfferService from "../../modules/offers/services/offer.service";
import { DirectTrade } from "../../modules/posts/entities/direct-trade.entity";
import postRepository from "../../modules/posts/repositories/post.repository";
import ratingRepository from "../../modules/ratings/repositories/rating.repository";
import RatingService from "../../modules/ratings/services/rating.service";
import { Club } from "../../modules/stickers/entities/club.entity";
import { NationalTeam } from "../../modules/stickers/entities/national-team.entity";
import { Player } from "../../modules/stickers/entities/player.entity";
import { Sticker } from "../../modules/stickers/entities/sticker.entity";
import userRepository from "../../modules/users/repositories/user.repository";

function createTestSticker(number: number) {
    const team = new NationalTeam("Argentina");
    const club = new Club("Club");
    const player = new Player(`Player ${number}`, team, club);
    return new Sticker(number, player, "NEW", "REGULAR");
}

describe("notifications facade", () => {
    beforeEach(async () => {
        await notificationRepository.clear();
    });

    it("offerReceived persiste una notificación con el tipo y payload correctos", async () => {
        await notifications.offerReceived("owner-1", {
            offerId: "of-1",
            postId: "p-1",
            fromUserId: "buyer-1",
        });

        const stored = await notificationRepository.findByUserId("owner-1");
        expect(stored).toHaveLength(1);
        expect(stored[0].type).toBe(NotificationType.OFFER_RECEIVED);
        expect(stored[0].payload).toEqual({
            offerId: "of-1",
            postId: "p-1",
            fromUserId: "buyer-1",
        });
    });

    it("auctionEnding serializa la fecha endsAt", async () => {
        const endsAt = new Date("2026-12-31T23:59:59Z");
        await notifications.auctionEnding("u", { postId: "p", endsAt });

        const stored = await notificationRepository.findByUserId("u");
        expect(stored[0].payload.endsAt).toBe(endsAt.toISOString());
    });

    it("ratingReceived guarda score y reviewer", async () => {
        await notifications.ratingReceived("u", {
            ratingId: "r",
            fromUserId: "rev",
            score: 4,
        });
        const [n] = await notificationRepository.findByUserId("u");
        expect(n.type).toBe(NotificationType.RATING_RECEIVED);
        expect(n.payload).toEqual({
            ratingId: "r",
            fromUserId: "rev",
            score: 4,
        });
    });
});

describe("integración: stubs de otros módulos disparan el facade", () => {
    let ownerId = "";
    let offererId = "";
    let postId = "";
    const offeredStickerId = 10;

    beforeEach(async () => {
        await userRepository.clear();
        await collectionRepository.clear();
        await offerRepository.clear();
        await postRepository.clear();
        await ratingRepository.clear();
        await notificationRepository.clear();

        const owner = await AuthService.getOrCreateUser("auth0|owner", {
            email: "owner@x.com",
            name: "Owner User",
        });
        const offerer = await AuthService.getOrCreateUser("auth0|offerer", {
            email: "offerer@x.com",
            name: "Offerer User",
        });

        ownerId = owner.id;
        offererId = offerer.id;

        const postSticker = createTestSticker(1);
        const post = new DirectTrade(owner, postSticker);
        post.setId("post-1");
        await postRepository.save(post);
        postId = post.id ?? "post-1";

        const offeredSticker = createTestSticker(offeredStickerId);
        await collectionRepository.addCollectionItem(offererId, {
            sticker: offeredSticker,
            quantity: 2,
        });
    });

    it("OfferService.createOffer notifica al postOwner cuando es distinto del offerer", async () => {
        await OfferService.createOffer(ownerId, postId, offererId, {
            offered: [{ stickerId: offeredStickerId, quantity: 1 }],
        });
        const stored = await notificationRepository.findByUserId(ownerId);
        expect(stored).toHaveLength(1);
        expect(stored[0].type).toBe(NotificationType.OFFER_RECEIVED);
    });

    it("OfferService.createOffer no notifica si el offerer es el propio dueño del post", async () => {
        const ownerSticker = createTestSticker(offeredStickerId + 1);
        await collectionRepository.addCollectionItem(ownerId, {
            sticker: ownerSticker,
            quantity: 1,
        });
        await expect(
            OfferService.createOffer(ownerId, postId, ownerId, {
                offered: [{ stickerId: ownerSticker.number, quantity: 1 }],
            }),
        ).rejects.toMatchObject({ statusCode: 403 });
        const stored = await notificationRepository.findByUserId(ownerId);
        expect(stored).toHaveLength(0);
    });

    it("RatingService.createRating notifica al reviewee", async () => {
        await RatingService.createRating(ownerId, offererId, { score: 5 });
        const stored = await notificationRepository.findByUserId(ownerId);
        expect(stored).toHaveLength(1);
        expect(stored[0].type).toBe(NotificationType.RATING_RECEIVED);
    });

    it("RatingService.createRating no notifica si reviewee === reviewer", async () => {
        await expect(
            RatingService.createRating(ownerId, ownerId, { score: 5 }),
        ).rejects.toMatchObject({ statusCode: 400 });
        expect(notificationRepository.findByUserId(ownerId)).toHaveLength(0);
    });
});
