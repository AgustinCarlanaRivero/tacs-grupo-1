import type { PostType } from "../enums/post-type.enum"

export default class PostService {
    static async listPosts(_filters: { type?: PostType; state?: string }) {
        return []
    }

    static async createPost(_ownerId: string, _body: unknown) {
        return []
    }

    static async getPostById(_ownerId: string, _postId: string) {
        return []
    }

    static async updatePostState(_ownerId: string, _postId: string, _state: unknown) {
        return []
    }

    static async listPostsByOwner(_userId: string) {
        return []
    }
}
