import { Router } from "express";
import PostController from "./post.controller.ts";

const router = Router();
const postController = new PostController();

// Un solo endpoint para crear, sin importar si es subasta o trade
router.post("/", postController.createPost);
router.get("/:id", postController.getPostById);

export default router;