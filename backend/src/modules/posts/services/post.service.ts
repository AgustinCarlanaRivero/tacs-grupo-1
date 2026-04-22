export default class PostService {
    static async listPosts(_filters: { type?: string; state?: string }) {
        return []
    }

    static async createPost(_ownerId: string, _body: unknown) {
        return []
    }

    static async getPostById(_postId: string) {
        return []
    }

    static async updatePostState(_postId: string, _state: unknown) {
        return []
    }

    static async listPostsByOwner(_userId: string) {
        return []
    }
}
