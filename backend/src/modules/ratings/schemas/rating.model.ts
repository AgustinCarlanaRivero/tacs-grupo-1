import mongoose from "mongoose";
import { createMongooseSchema } from "../../../infra/database/schema-helpers";
import { nonEmptyString } from "../../../shared/validation/common";
import { Rating } from "../entities/rating.entity";
import { ratingResponseSchema } from "./rating.schemas";

const ratingPersistenceSchema = ratingResponseSchema
    .omit({
        id: true,
    })
    .extend({
        _id: nonEmptyString,
    });

const ratingModelSchema = createMongooseSchema(ratingPersistenceSchema);

ratingModelSchema.loadClass(Rating);

export const RatingModel =
    mongoose.models.Rating ?? mongoose.model("Rating", ratingModelSchema);
