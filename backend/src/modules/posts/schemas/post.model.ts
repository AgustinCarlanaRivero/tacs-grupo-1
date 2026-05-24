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

postModelSchema.loadClass(Post);
overrideSchemaPath(postModelSchema, "sticker", stickerModelSchema);

export const PostModel =
    mongoose.models.Post ?? mongoose.model("Post", postModelSchema);
