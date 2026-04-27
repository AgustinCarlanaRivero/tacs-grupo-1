export type OfferRole = "sent" | "received" | "all"

export default class OfferService {
    static async getOffersByUser(_userId: string, _role: OfferRole) {
        return []
    }

    static async getOffersByPost(_postOwnerId: string, _postId: string) {
        return []
    }

    static async createOffer(_postOwnerId: string, _postId: string, _offererId: string, _body: unknown) {
        return []
    }

    static async updateOfferState(
        _postOwnerId: string,
        _postId: string,
        _offerId: string,
        _state: unknown,
        _actorId: string,
    ) {
        return []
    }
}
