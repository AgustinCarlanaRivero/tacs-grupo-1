import mongoose from "mongoose";
import { createMongooseSchema } from "../../../infra/database/schema-helpers";
import { nonEmptyString } from "../../../shared/validation/common";
import { Notification } from "../entities/notification.entity";
import { notificationResponseSchema } from "./notification.schemas";

const notificationPersistenceSchema = notificationResponseSchema
    .omit({
        id: true,
    })
    .extend({
        _id: nonEmptyString,
    });

const notificationModelSchema = createMongooseSchema(
    notificationPersistenceSchema,
);

notificationModelSchema.loadClass(Notification);

export const NotificationModel =
    mongoose.models.Notification ??
    mongoose.model("Notification", notificationModelSchema);
