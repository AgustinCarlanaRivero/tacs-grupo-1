import { Post } from "../entities/post.entity";

class PostRepository {
    private posts: Map<string, Post> = new Map();
    private ownerIndex: Map<string, string[]> = new Map();

    save(post: Post): Post {
        const id = post.id ?? crypto.randomUUID();
        if (!post.id) {
            post.setId(id);
        }
        const isNew = !this.posts.has(id);

        this.posts.set(id, post);

        if (isNew && post.owner.id) {
            const ownerPosts = this.ownerIndex.get(post.owner.id) ?? [];
            ownerPosts.push(id);
            this.ownerIndex.set(post.owner.id, ownerPosts);
        }

        return post;
    }

    findById(id: string): Post | undefined {
        return this.posts.get(id);
    }

    findAll(): Post[] {
        return Array.from(this.posts.values());
    }

    findByOwnerId(ownerId: string): Post[] {
        const ids = this.ownerIndex.get(ownerId) ?? [];
        return ids
            .map((id) => this.posts.get(id))
            .filter((post): post is Post => post !== undefined);
    }

    delete(id: string): boolean {
        const post = this.posts.get(id);
        if (!post) return false;

        this.posts.delete(id);

        const ownerId = post.owner.id;
        if (ownerId) {
            const ownerPosts = this.ownerIndex.get(ownerId) ?? [];
            const filtered = ownerPosts.filter((postId) => postId !== id);
            if (filtered.length === 0) {
                this.ownerIndex.delete(ownerId);
            } else {
                this.ownerIndex.set(ownerId, filtered);
            }
        }

        return true;
    }

    clear(): void {
        this.posts.clear();
        this.ownerIndex.clear();
    }
}

export default new PostRepository();
