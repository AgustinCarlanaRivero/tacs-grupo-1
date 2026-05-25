import type { FilterQuery, HydratedDocument } from "mongoose";
import { BaseRepository } from "../../../infra/database/base.repository";
import type { CollectionItem } from "../../collection/entities/collection-item.interface";
import { User } from "../../users/entities/user.entity";
import { UserRole } from "../../users/enums/user-role.enum";
import { Offer } from "../entities/offer.entity";
import { OfferState } from "../enums/offer-state.enum";
import { OfferModel } from "../schemas/offer.model";

export type OfferReadModel = Offer & {
    postId: string;
    postOwnerId: string;
};

type OfferPersistence = {
    _id: string;
    state: OfferState;
    createdAt: Date;
    offererId: string;
    offered: CollectionItem[];
    postId: string;
    postOwnerId: string;
    offerer?: User;
};

const buildUserRef = (id: string) =>
    new User("", "", "", "", UserRole.STANDARD, 0, null, id);

class OfferRepository extends BaseRepository<OfferPersistence, OfferReadModel> {
    constructor() {
        super(OfferModel, {
            defaultPopulate: [{ path: "offerer", select: "_id username" }],
        });
    }

    protected toEntity(
        doc: HydratedDocument<OfferPersistence>,
    ): OfferReadModel {
        const offerer = doc.offerer ?? buildUserRef(doc.offererId);
        const offer = new Offer(
            offerer,
            doc.offered ?? [],
            doc.state,
            doc.createdAt,
            doc._id,
        );

        return Object.assign(offer, {
            postId: doc.postId,
            postOwnerId: doc.postOwnerId,
        });
    }

    protected toPersistence(
        offer: OfferReadModel,
    ): Partial<OfferPersistence> & { _id?: string } {
        const id = offer.id || crypto.randomUUID();
        if (!offer.id) {
            offer.setId(id);
        }

        return {
            _id: id,
            state: offer.state,
            createdAt: offer.createdAt,
            offererId: offer.offerer.id,
            offered: offer.offered,
            postId: offer.postId,
            postOwnerId: offer.postOwnerId,
        };
    }

    async save(offer: OfferReadModel): Promise<OfferReadModel> {
        return super.save(offer);
    }

    async findById(id: string): Promise<OfferReadModel | null> {
        return super.findById(id);
    }

    async findByPostId(postId: string): Promise<OfferReadModel[]> {
        return this.findMany({ postId } as FilterQuery<OfferPersistence>);
    }

    async findByUserId(userId: string): Promise<OfferReadModel[]> {
        return this.findMany({
            $or: [{ postOwnerId: userId }, { offererId: userId }],
        } as FilterQuery<OfferPersistence>);
    }

    async findAll(): Promise<OfferReadModel[]> {
        return this.findMany();
    }

    async delete(id: string): Promise<boolean> {
        return this.deleteById(id);
    }

    async deleteByPostId(postId: string): Promise<number> {
        return this.deleteMany({ postId } as FilterQuery<OfferPersistence>);
    }

    async clear(): Promise<void> {
        await this.deleteMany({} as FilterQuery<OfferPersistence>);
    }
}

export default new OfferRepository();
