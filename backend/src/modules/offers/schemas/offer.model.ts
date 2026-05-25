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
overrideSchemaPath(offerModelSchema, "offered", [collectionItemModelSchema]);

export const OfferModel =
    mongoose.models.Offer ?? mongoose.model("Offer", offerModelSchema);
