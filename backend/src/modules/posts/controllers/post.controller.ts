import { Request, Response } from "express"
import type { z } from "zod"
import { UnauthorizedError, ForbiddenError } from "../../../shared/errors/http-errors"
import {
    userIdParamSchema,
    userPostParamsSchema,
} from "../../../shared/validation/common"
import {
    postCreateRequestSchema,
    postFilterQuerySchema,
    postStateUpdateRequestSchema,
} from "../schemas/post.schemas"
import PostService from "../services/post.service"

type UserParams = z.infer<typeof userIdParamSchema>
type UserPostParams = z.infer<typeof userPostParamsSchema>
type PostFilterQuery = z.infer<typeof postFilterQuerySchema>
type CreatePostBody = z.infer<typeof postCreateRequestSchema>
type UpdateStateBody = z.infer<typeof postStateUpdateRequestSchema>

function getAuthUserId(req: Request): string | undefined {
    const user = (req as Request & { user?: { id: string } }).user
    return user?.id
}

export default class PostController {
    listPosts = async (req: Request, res: Response) => {
        const { type, state, query, page, limit } = req.query as unknown as PostFilterQuery
        const posts = await PostService.listPosts({ type, state, query, page, limit })
        return res.status(200).json(posts)
    }

    createPost = async (req: Request, res: Response) => {
        const { userId: ownerId } = req.params as UserParams
        const authUserId = getAuthUserId(req)

        if (!authUserId) {
            throw new UnauthorizedError()
        }

        if (ownerId !== authUserId) {
            throw new ForbiddenError("No autorizado para crear publicaciones en otro usuario")
        }

        const body = req.body as CreatePostBody
        const newPost = await PostService.createPost(ownerId, body)
        return res.status(201).json(newPost)
    }

    getPostById = async (req: Request, res: Response) => {
        const { userId: ownerId, postId } = req.params as UserPostParams
        const post = await PostService.getPostById(ownerId, postId)
        return res.status(200).json(post)
    }

    updatePostState = async (req: Request, res: Response) => {
        const { userId: ownerId, postId } = req.params as UserPostParams
        const { state } = req.body as UpdateStateBody
        const updated = await PostService.updatePostState(ownerId, postId, state)
        return res.status(200).json(updated)
    }

    listPostsByOwner = async (req: Request, res: Response) => {
        const { userId } = req.params as UserParams
        const { type, state, query, page, limit } = req.query as unknown as PostFilterQuery
        const posts = await PostService.listPostsByOwner(userId, { type, state, query, page, limit })
        return res.status(200).json(posts)
    }
}
