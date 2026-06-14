import { Router } from "express";
import adminRoutes from "../modules/admin/routes/admin.routes";
import {
    attachDevUser,
    attachUser,
    verifyJwt,
} from "../modules/auth/middleware/auth.middleware";
import authRoutes from "../modules/auth/routes/auth.routes";
import matchingRoutes from "../modules/matching/routes/matching.routes";
import notificationRoutes from "../modules/notifications/routes/notification.routes";
import postsRoutes from "../modules/posts/routes/post-direct.routes";
import stickersRoutes from "../modules/stickers/routes/sticker.routes";
import templatesRoutes from "../modules/templates/routes/template.routes";
import userRoutes from "../modules/users/routes/user.routes";

const router = Router();
const disableAuth = process.env.DISABLE_AUTH === "true";
const authChain = disableAuth ? [attachDevUser] : [verifyJwt, attachUser];

router.use("/auth", ...authChain, authRoutes);
router.use("/admin", ...authChain, adminRoutes);

router.use("/users", ...authChain, userRoutes);
router.use("/posts", ...authChain, postsRoutes);
router.use("/stickers", stickersRoutes);
router.use("/templates", ...authChain, templatesRoutes);
router.use("/notifications", ...authChain, notificationRoutes);
router.use("/matches", ...authChain, matchingRoutes);

export default router;
