import mongoose from "mongoose";
import {
    createMongooseSchema,
    overrideSchemaPath,
} from "../../../infra/database/schema-helpers";
import { nonEmptyString } from "../../../shared/validation/common";
import { Rating } from "../entities/rating.entity";
import { ratingResponseSchema } from "./rating.schemas";

const ratingPersistenceSchema = ratingResponseSchema
    .omit({
        id: true,
    })
    .extend({
        _id: nonEmptyString,
        reviewerId: nonEmptyString,
        revieweeId: nonEmptyString,
    });

const ratingModelSchema = createMongooseSchema(ratingPersistenceSchema);

ratingModelSchema.loadClass(Rating);
overrideSchemaPath(ratingModelSchema, "_id", {
    type: mongoose.Schema.Types.ObjectId,
});
overrideSchemaPath(ratingModelSchema, "reviewerId", {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
});
overrideSchemaPath(ratingModelSchema, "revieweeId", {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
});

ratingModelSchema.index({ revieweeId: 1 });
ratingModelSchema.index({ reviewerId: 1 });

export const RatingModel =
    mongoose.models.Rating ?? mongoose.model("Rating", ratingModelSchema);
