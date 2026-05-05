import { Offer } from "../entities/offer.entity";

export type OfferRecord = {
    offer: Offer;
    postId: string;
    postOwnerId: string;
};

class OfferRepository {
    private offers: Map<string, OfferRecord> = new Map();

    save(record: OfferRecord): OfferRecord {
        const id = record.offer.id ?? crypto.randomUUID();
        if (!record.offer.id) {
            record.offer.setId(id);
        }
        this.offers.set(id, record);
        return record;
    }

    findById(id: string): OfferRecord | undefined {
        return this.offers.get(id);
    }

    findByPostId(postId: string): OfferRecord[] {
        return Array.from(this.offers.values()).filter(
            (record) => record.postId === postId,
        );
    }

    findByUserId(userId: string): OfferRecord[] {
        return Array.from(this.offers.values()).filter((record) => {
            const offererId = record.offer.offerer.id;
            return offererId === userId || record.postOwnerId === userId;
        });
    }

    findAll(): OfferRecord[] {
        return Array.from(this.offers.values());
    }

    delete(id: string): boolean {
        return this.offers.delete(id);
    }

    clear(): void {
        this.offers.clear();
    }
}

export default new OfferRepository();
