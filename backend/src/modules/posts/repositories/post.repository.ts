import type { FilterQuery, HydratedDocument } from "mongoose";
import { BaseRepository } from "../../../infra/database/base.repository";
import {
    createObjectIdString,
    toIdString,
    toObjectId,
    type PersistenceId,
} from "../../../infra/database/schema-helpers";
import { Offer } from "../../offers/entities/offer.entity";
import { Sticker } from "../../stickers/entities/sticker.entity";
import { User } from "../../users/entities/user.entity";
import { UserRole } from "../../users/enums/user-role.enum";
import { Auction } from "../entities/auction.entity";
import { DirectTrade } from "../entities/direct-trade.entity";
import { Post } from "../entities/post.entity";
import { PostState } from "../enums/post-state.enum";
import { PostType } from "../enums/post-type.enum";
import { PostModel } from "../schemas/post.model";

type PostPersistence = {
    _id: PersistenceId;
    type: PostType;
    state: PostState;
    ownerId: PersistenceId;
    sticker: Sticker;
    createdAt?: Date;
    endsAt?: Date;
    minimumRequirement?: number;
    offers?: Offer[];
    owner?: User;
};

const buildUserRef = (id: string) =>
    new User("", "", "", "", UserRole.STANDARD, 0, null, id);

class PostRepository extends BaseRepository<PostPersistence, Post> {
    constructor() {
        super(PostModel, {
            defaultPopulate: [{ path: "owner", select: "_id username" }],
            populateProfiles: {
                withOffers: [{ path: "offers" }],
            },
        });
    }

    protected toEntity(doc: HydratedDocument<PostPersistence>): Post {
        const owner = doc.owner ?? buildUserRef(toIdString(doc.ownerId));
        const offers = Array.isArray(doc.offers) ? (doc.offers as Offer[]) : [];
        const id = toIdString(doc._id);

        if (doc.type === PostType.AUCTION) {
            return new Auction(
                owner,
                doc.sticker,
                doc.createdAt ?? new Date(),
                doc.endsAt ?? doc.createdAt ?? new Date(),
                doc.minimumRequirement ?? 1,
                doc.state,
                offers,
                id,
            );
        }

        return new DirectTrade(owner, doc.sticker, doc.state, offers, id);
    }

    protected toPersistence(
        post: Post,
    ): Partial<PostPersistence> & { _id?: PersistenceId } {
        const id = post.id || createObjectIdString();
        if (!post.id) {
            post.setId(id);
        }

        const base = {
            _id: toObjectId(id),
            type: post.getType(),
            state: post.state,
            ownerId: toObjectId(post.owner.id),
            sticker: post.sticker,
        } as Partial<PostPersistence> & { _id?: PersistenceId };

        if (post instanceof Auction) {
            return {
                ...base,
                createdAt: post.createdAt,
                endsAt: post.endsAt,
                minimumRequirement: post.minimumRequirement,
            };
        }

        return base;
    }

    async save(post: Post): Promise<Post> {
        return super.save(post);
    }

    async findById(id: string): Promise<Post | null> {
        return super.findById(id);
    }

    async findByIdWithOffers(id: string): Promise<Post | null> {
        return super.findById(id, "withOffers");
    }

    async findAll(): Promise<Post[]> {
        return this.findMany();
    }

    async findByOwnerId(ownerId: string): Promise<Post[]> {
        return this.findMany({ ownerId } as FilterQuery<PostPersistence>);
    }

    async delete(id: string): Promise<boolean> {
        return this.deleteById(id);
    }

    async clear(): Promise<void> {
        await this.deleteMany({} as FilterQuery<PostPersistence>);
    }
}


export default new PostRepository();

