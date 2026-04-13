import { Request, Response } from "express"
import PostService from "./post.service.ts"

function paramAsString(value: string | string[] | undefined): string {
    if (value === undefined) return ""
    return Array.isArray(value) ? (value[0] ?? "") : value
}

function getAuthUserId(req: Request): string | undefined {
    const user = (req as Request & { user?: { id: string } }).user
    return user?.id
}

export default class PostController {
    listPosts = async (req: Request, res: Response) => {
        const { type, state } = req.query
        const posts = await PostService.listPosts({
            type: typeof type === "string" ? type : undefined,
            state: typeof state === "string" ? state : undefined,
        })
        return res.status(200).json(posts)
    }

    createPost = async (req: Request, res: Response) => {
        const userId = getAuthUserId(req)
        if (!userId) {
            return res.status(401).json({ error: "No autenticado" })
        }

        const { type } = req.body as { type?: string }
        if (type !== "DIRECT_TRADE" && type !== "AUCTION") {
            return res.status(400).json({ error: "Tipo de publicación inválido" })
        }

        const newPost = await PostService.createPost(userId, req.body)
        return res.status(201).json(newPost)
    }

    getPostById = async (req: Request, res: Response) => {
        const postId = paramAsString(req.params.postId)
        const post = await PostService.getPostById(postId)
        return res.status(200).json(post)
    }

    updatePostState = async (req: Request, res: Response) => {
        const postId = paramAsString(req.params.postId)
        const { state } = req.body as { state?: unknown }
        const updated = await PostService.updatePostState(postId, state)
        return res.status(200).json(updated)
    }

    listPostsByOwner = async (req: Request, res: Response) => {
        const userId = paramAsString(req.params.userId)
        const posts = await PostService.listPostsByOwner(userId)
        return res.status(200).json(posts)
    }
}
