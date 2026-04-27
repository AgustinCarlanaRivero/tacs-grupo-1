import { Request, Response } from "express"
import PostService from "../services/post.service"
import { AppError } from "../../../shared/errors/app-error"
import { isPostType } from "../enums/post-type.enum"

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
        const postType = typeof type === "string" && isPostType(type) ? type : undefined

        const posts = await PostService.listPosts({
            type: postType,
            state: typeof state === "string" ? state : undefined,
        })
        return res.status(200).json(posts)
    }

    createPost = async (req: Request, res: Response) => {
        const ownerId = paramAsString(req.params.userId)
        const authUserId = getAuthUserId(req)

        if (!authUserId) {
            throw new AppError("No autenticado", 401)
        }

        if (!ownerId) {
            throw new AppError("El parámetro userId es requerido", 400)
        }

        if (ownerId !== authUserId) {
            throw new AppError("No autorizado para crear publicaciones en otro usuario", 403)
        }

        const { type } = req.body as { type?: string }
        if (!isPostType(type)) {
            throw new AppError("Tipo de publicación inválido", 400)
        }

        const newPost = await PostService.createPost(ownerId, req.body)
        return res.status(201).json(newPost)
    }

    getPostById = async (req: Request, res: Response) => {
        const ownerId = paramAsString(req.params.userId)
        const postId = paramAsString(req.params.postId)
        const post = await PostService.getPostById(ownerId, postId)
        return res.status(200).json(post)
    }

    updatePostState = async (req: Request, res: Response) => {
        const ownerId = paramAsString(req.params.userId)
        const postId = paramAsString(req.params.postId)
        const { state } = req.body as { state?: unknown }
        const updated = await PostService.updatePostState(ownerId, postId, state)
        return res.status(200).json(updated)
    }

    listPostsByOwner = async (req: Request, res: Response) => {
        const userId = paramAsString(req.params.userId)
        const posts = await PostService.listPostsByOwner(userId)
        return res.status(200).json(posts)
    }
}
