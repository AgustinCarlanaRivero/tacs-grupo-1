import { CollectionItem } from "../../modules/collection/entities/collection-item.interface";
import { Offer } from "../../modules/offers/entities/offer.entity";
import offerRepository from "../../modules/offers/repositories/offer.repository";
import OfferService from "../../modules/offers/services/offer.service";
import { DirectTrade } from "../../modules/posts/entities/direct-trade.entity";
import postRepository from "../../modules/posts/repositories/post.repository";
import { Category } from "../../modules/stickers/entities/category.entity";
import { Player } from "../../modules/stickers/entities/player.entity";
import { Sticker } from "../../modules/stickers/entities/sticker.entity";
import { User } from "../../modules/users/entities/user.entity";
import userRepository from "../../modules/users/repositories/user.repository";
import { NotFoundError } from "../../shared/errors/http-errors";

describe("OfferService", () => {
    beforeEach(() => {
        offerRepository.clear();
        postRepository.clear();
        userRepository.clear();
    });

    test("getOffersByUser returns sent/received filtering", async () => {
        const owner = new User("O", "One", "owner", "o@x.com");
        owner.setId("owner");
        const offerer = new User("F", "Two", "from", "f@x.com");
        offerer.setId("from");
        userRepository.save(owner);
        userRepository.save(offerer);

        const player = new Player(
            "P",
            { name: "NT" } as any,
            { name: "C" } as any,
        );
        const sticker = new Sticker(21, player, new Category("NEW", "REGULAR"));

        const post = new DirectTrade(owner, sticker);
        post.setId("post1");
        postRepository.save(post);

        const offered: CollectionItem[] = [{ sticker, quantity: 1 }];
        const offer = new Offer(offerer, offered);
        offer.setId("offer1");
        post.addOffer(offer);

        offerRepository.save({
            offer,
            postId: post.id ?? "post1",
            postOwnerId: owner.id,
        });

        const sent = await OfferService.getOffersByUser("from", {
            page: 1,
            limit: 10,
            role: "sent" as any,
        });
        expect(sent.total).toBe(1);

        const received = await OfferService.getOffersByUser("owner", {
            page: 1,
            limit: 10,
            role: "received" as any,
        });
        expect(received.total).toBe(1);
    });

    test("createOffer throws when post not found", async () => {
        const offerer = new User("F", "Two", "from", "f@x.com");
        offerer.setId("from");
        userRepository.save(offerer);

        await expect(
            OfferService.createOffer("owner", "nope", "from", {
                offered: [{ stickerId: 1 }],
            }),
        ).rejects.toThrow(NotFoundError);
    });
});
