import type { PostType } from "../enums/post-type.enum"
import {
    getStickerSearchValues,
    matchesAnyQuery,
    normalizeQuery,
    paginate,
    type StickerSearchInput,
} from "../../../shared/utils/query"

type PostListFilters = {
    type?: PostType
    state?: string
    query?: string
    page: number
    limit: number
}

type PostLike = {
    type?: PostType | string
    state?: string
    sticker?: StickerSearchInput
    owner?: { id?: string } | null
    ownerId?: string
}

function getPostOwnerId(post: PostLike): string | undefined {
    return post.ownerId ?? post.owner?.id
}

function matchesPostQuery(post: PostLike, query?: string): boolean {
    if (!query) return true
    return matchesAnyQuery(getStickerSearchValues(post.sticker), query)
}

export default class PostService {
    static async listPosts(filters: PostListFilters) {
        const posts: PostLike[] = []
        return this.applyFilters(posts, filters)
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

    static async listPostsByOwner(userId: string, filters: PostListFilters) {
        const posts: PostLike[] = []
        const ownedPosts = posts.filter(post => getPostOwnerId(post) === userId)
        return this.applyFilters(ownedPosts, filters)
    }

    private static applyFilters(posts: PostLike[], filters: PostListFilters) {
        const normalizedQuery = normalizeQuery(filters.query)
        const filtered = posts.filter(post => {
            if (filters.type && post.type !== filters.type) return false
            if (filters.state && post.state !== filters.state) return false
            return matchesPostQuery(post, normalizedQuery)
        })

        return paginate(filtered, filters.page, filters.limit)
    }
}
