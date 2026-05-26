import mongoose from "mongoose";
import {
    createMongooseSchema,
    overrideSchemaPath,
} from "../../../infra/database/schema-helpers";
import { nonEmptyString } from "../../../shared/validation/common";
import { Notification } from "../entities/notification.entity";
import { notificationResponseSchema } from "./notification.schemas";

const notificationPersistenceSchema = notificationResponseSchema
    .omit({
        id: true,
    })
    .extend({
        _id: nonEmptyString,
        userId: nonEmptyString,
    });

const notificationModelSchema = createMongooseSchema(
    notificationPersistenceSchema,
);

notificationModelSchema.loadClass(Notification);
overrideSchemaPath(notificationModelSchema, "_id", {
    type: mongoose.Schema.Types.ObjectId,
});
overrideSchemaPath(notificationModelSchema, "userId", {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
});

notificationModelSchema.index({ userId: 1 });
notificationModelSchema.index({ read: 1 });
notificationModelSchema.index({ createdAt: -1 });

export const NotificationModel =
    mongoose.models.Notification ??
    mongoose.model("Notification", notificationModelSchema);
