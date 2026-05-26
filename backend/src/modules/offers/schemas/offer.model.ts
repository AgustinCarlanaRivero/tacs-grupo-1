import mongoose from "mongoose";
import { z } from "zod";
import {
    createMongooseSchema,
    overrideSchemaPath,
} from "../../../infra/database/schema-helpers";
import { nonEmptyString } from "../../../shared/validation/common";
import {
    collectionItemModelSchema,
    collectionItemPersistenceSchema,
} from "../../collection/schemas/collection.model";
import { Offer } from "../entities/offer.entity";
import { offerResponseSchema } from "./offer.schemas";

const offerPersistenceSchema = offerResponseSchema
    .omit({
        id: true,
        offerer: true,
        offered: true,
    })
    .extend({
        _id: nonEmptyString,
        offererId: nonEmptyString,
        postId: nonEmptyString,
        postOwnerId: nonEmptyString,
        offered: z.array(collectionItemPersistenceSchema),
    });

const offerModelSchema = createMongooseSchema(offerPersistenceSchema, {
    omitPaths: ["offererId"],
});

offerModelSchema.virtual("offerer", {
    ref: "User",
    localField: "offererId",
    foreignField: "_id",
    justOne: true,
});

offerModelSchema.loadClass(Offer);
overrideSchemaPath(offerModelSchema, "_id", {
    type: mongoose.Schema.Types.ObjectId,
});
overrideSchemaPath(offerModelSchema, "offererId", {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
});
overrideSchemaPath(offerModelSchema, "postId", {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
});
overrideSchemaPath(offerModelSchema, "postOwnerId", {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
});
overrideSchemaPath(offerModelSchema, "offered", [collectionItemModelSchema]);

offerModelSchema.index({ postId: 1 });
offerModelSchema.index({ postOwnerId: 1 });
offerModelSchema.index({ offererId: 1 });
offerModelSchema.index({ state: 1 });
offerModelSchema.index({ createdAt: -1 });

export const OfferModel =
    mongoose.models.Offer ?? mongoose.model("Offer", offerModelSchema);
