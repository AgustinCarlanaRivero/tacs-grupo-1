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
    schemaOptions: { suppressReservedKeysWarning: true },
});

userModelSchema.path("auth0Sub").select(false);
userModelSchema.loadClass(User);
overrideSchemaPath(userModelSchema, "_id", {
    type: mongoose.Schema.Types.ObjectId,
});
overrideSchemaPath(userModelSchema, "collection", collectionModelSchema);

userModelSchema.index({ "collection.items.sticker.number": 1 });
userModelSchema.index({ "collection.missingStickers.number": 1 });
userModelSchema.index({ "collection.items.sticker.state": 1 });
userModelSchema.index({ "collection.items.sticker.type": 1 });
userModelSchema.index({ "collection.items.sticker.player.nationalTeam.name": 1 });
userModelSchema.index({ "collection.items.sticker.player.club.name": 1 });
userModelSchema.index({ "collection.missingStickers.state": 1 });
userModelSchema.index({ "collection.missingStickers.type": 1 });
userModelSchema.index({ "collection.missingStickers.player.nationalTeam.name": 1 });
userModelSchema.index({ "collection.missingStickers.player.club.name": 1 });
userModelSchema.index({ reputation: 1 });

export const UserModel =
    mongoose.models.User ?? mongoose.model("User", userModelSchema);
