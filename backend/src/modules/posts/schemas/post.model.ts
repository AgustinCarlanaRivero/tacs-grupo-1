import mongoose from "mongoose";
import {
    createMongooseSchema,
    overrideSchemaPath,
} from "../../../infra/database/schema-helpers";
import { nonEmptyString } from "../../../shared/validation/common";
import {
    stickerModelSchema,
    stickerPersistenceSchema,
} from "../../stickers/schemas/sticker.model";
import { Post } from "../entities/post.entity";
import { postResponseSchema } from "./post.schemas";

const postPersistenceSchema = postResponseSchema
    .omit({
        id: true,
        owner: true,
        sticker: true,
    })
    .extend({
        _id: nonEmptyString,
        ownerId: nonEmptyString,
        sticker: stickerPersistenceSchema,
    });

const postModelSchema = createMongooseSchema(postPersistenceSchema, {
    omitPaths: ["ownerId"],
});

postModelSchema.virtual("owner", {
    ref: "User",
    localField: "ownerId",
    foreignField: "_id",
    justOne: true,
});

postModelSchema.virtual("offers", {
    ref: "Offer",
    localField: "_id",
    foreignField: "postId",
    justOne: false,
});

postModelSchema.loadClass(Post);
overrideSchemaPath(postModelSchema, "_id", {
    type: mongoose.Schema.Types.ObjectId,
});
overrideSchemaPath(postModelSchema, "ownerId", {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
});
overrideSchemaPath(postModelSchema, "sticker", stickerModelSchema);

postModelSchema.index({ ownerId: 1 });
postModelSchema.index({ state: 1 });
postModelSchema.index({ type: 1 });
postModelSchema.index({ createdAt: -1 });

export const PostModel =
    mongoose.models.Post ?? mongoose.model("Post", postModelSchema);
