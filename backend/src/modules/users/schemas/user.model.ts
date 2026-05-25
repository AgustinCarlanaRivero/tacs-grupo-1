import mongoose from "mongoose";
import { z } from "zod";
import {
    createMongooseSchema,
    overrideSchemaPath,
} from "../../../infra/database/schema-helpers";
import { nonEmptyString } from "../../../shared/validation/common";
import {
    collectionModelSchema,
    collectionPersistenceSchema,
} from "../../collection/schemas/collection.model";
import { User } from "../entities/user.entity";
import { userResponseSchema } from "./user.schemas";

const userPersistenceSchema = userResponseSchema.omit({ id: true }).extend({
    _id: nonEmptyString,
    auth0Sub: z.string(),
    collection: collectionPersistenceSchema.nullable(),
});

const userModelSchema = createMongooseSchema(userPersistenceSchema, {
    omitPaths: ["auth0Sub", "collection"],
});

userModelSchema.path("auth0Sub").select(false);
userModelSchema.loadClass(User);
overrideSchemaPath(userModelSchema, "collection", collectionModelSchema);

userModelSchema.index({ "collection.items.sticker.number": 1 });
userModelSchema.index({ "collection.missingStickers.number": 1 });
userModelSchema.index({ reputation: 1 });

export const UserModel =
    mongoose.models.User ?? mongoose.model("User", userModelSchema);
