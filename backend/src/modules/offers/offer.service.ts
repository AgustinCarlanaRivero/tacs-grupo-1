export default class OfferService {
    static async getOffersByPost(_postId: string) {
        return []
    }

    static async createOffer(_postId: string, _offererId: string, _body: unknown) {
        return []
    }

    static async updateOfferState(_offerId: string, _state: unknown) {
        return []
    }

    static async deleteOffer(_offerId: string, _userId: string) {
        return null
    }
}
