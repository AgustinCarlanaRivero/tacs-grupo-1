import { Collection } from "../../modules/collection/entities/collection.entity";
import type { CollectionItem } from "../../modules/collection/entities/collection-item.interface";
import { Notification } from "../../modules/notifications/entities/notification.entity";
import { NotificationType } from "../../modules/notifications/enums/notification-type.enum";
import { Offer } from "../../modules/offers/entities/offer.entity";
import type { OfferReadModel } from "../../modules/offers/repositories/offer.repository";
import { DirectTrade } from "../../modules/posts/entities/direct-trade.entity";
import { Auction } from "../../modules/posts/entities/auction.entity";
import type { Post } from "../../modules/posts/entities/post.entity";
import { Rating } from "../../modules/ratings/entities/rating.entity";
import { Club } from "../../modules/stickers/entities/club.entity";
import { NationalTeam } from "../../modules/stickers/entities/national-team.entity";
import { Player } from "../../modules/stickers/entities/player.entity";
import { Sticker } from "../../modules/stickers/entities/sticker.entity";
import { User } from "../../modules/users/entities/user.entity";
import { UserRole } from "../../modules/users/enums/user-role.enum";

export const buildUser = (
    id: string,
    overrides: Partial<{
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        role: UserRole;
        reputation: number;
        collection: Collection | null;
    }> = {},
): User => {
    const username = overrides.username ?? id;
    const user = new User(
        overrides.firstName ?? "Test",
        overrides.lastName ?? "User",
        username,
        overrides.email ?? `${username}@example.com`,
        overrides.role ?? UserRole.STANDARD,
        overrides.reputation ?? 0,
        overrides.collection ?? null,
    );
    user.setId(id);
    return user;
};

export const buildSticker = (
    number: number,
    overrides: Partial<{
        playerName: string;
        teamName: string;
        clubName: string;
        state: "NEW" | "DAMAGED";
        type: "REGULAR" | "SHINY";
    }> = {},
): Sticker => {
    const player = new Player(
        overrides.playerName ?? `Player ${number}`,
        new NationalTeam(overrides.teamName ?? "Argentina"),
        new Club(overrides.clubName ?? "FC Test"),
    );
    return new Sticker(
        number,
        player,
        overrides.state ?? "NEW",
        overrides.type ?? "REGULAR",
    );
};

export const buildDirectTrade = (
    id: string,
    owner: User,
    stickerNumber: number,
): Post => {
    const post = new DirectTrade(owner, buildSticker(stickerNumber));
    post.setId(id);
    return post;
};

export const buildAuction = (
    id: string,
    owner: User,
    stickerNumber: number,
    overrides: Partial<{ endsAt: Date; minimumRequirement: number }> = {},
): Post => {
    const post = new Auction(
        owner,
        buildSticker(stickerNumber),
        new Date(),
        overrides.endsAt ?? new Date(Date.now() + 60_000),
        overrides.minimumRequirement ?? 1,
    );
    post.setId(id);
    return post;
};

export const buildOffer = (
    id: string,
    offerer: User,
    offered: CollectionItem[],
    extras: { postId: string; postOwnerId: string },
): OfferReadModel => {
    const offer = new Offer(offerer, offered);
    offer.setId(id);
    return Object.assign(offer, extras);
};

export const buildCollectionItem = (
    sticker: Sticker,
    quantity = 1,
): CollectionItem => ({
    sticker,
    quantity,
});

export const buildCollection = (
    items: CollectionItem[] = [],
    missing: Sticker[] = [],
): Collection => new Collection(items, missing);

export const buildRating = (
    id: string,
    reviewer: User,
    reviewee: User,
    score = 5,
    comment = "ok",
): Rating => {
    const rating = new Rating(reviewer, reviewee, score, comment, new Date());
    rating.setId(id);
    return rating;
};

export const buildNotification = (
    id: string,
    userId: string,
    overrides: Partial<{
        type: NotificationType;
        message: string;
        read: boolean;
        payload: Record<string, unknown>;
        createdAt: Date;
    }> = {},
): Notification => {
    const n = new Notification(
        userId,
        overrides.type ?? NotificationType.OFFER_RECEIVED,
        overrides.message ?? "msg",
        overrides.payload ?? {},
        overrides.createdAt ?? new Date(),
    );
    n.setId(id);
    if (overrides.read) n.read = true;
    return n;
};
