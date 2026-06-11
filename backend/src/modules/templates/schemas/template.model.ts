import mongoose from "mongoose";
import { z } from "zod";
import {
  createMongooseSchema,
  overrideSchemaPath,
} from "../../../infra/database/schema-helpers";
import { nonEmptyString } from "../../../shared/validation/common";
import {
  stickerModelSchema,
  stickerPersistenceSchema,
} from "../../stickers/schemas/sticker.model";
import { Template } from "../entities/template.entity";
import { templateResponseSchema } from "./template.schemas";

const templatePersistenceSchema = templateResponseSchema
  .omit({
    _id: true,
    sticker: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    _id: nonEmptyString.optional(),
    userId: nonEmptyString,
    sticker: stickerPersistenceSchema,
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  });

const templateModelSchema = createMongooseSchema(
  templatePersistenceSchema,
  {
    schemaOptions: {
      timestamps: true,
    },
  },
);

templateModelSchema.loadClass(Template);
overrideSchemaPath(templateModelSchema, "_id", {
  type: mongoose.Schema.Types.ObjectId,
});
overrideSchemaPath(templateModelSchema, "userId", {
  type: mongoose.Schema.Types.ObjectId,
});
overrideSchemaPath(templateModelSchema, "sticker", stickerModelSchema);

// Índices para búsqueda eficiente
templateModelSchema.index({ userId: 1, createdAt: -1 });
templateModelSchema.index({ name: "text" });

export const TemplateModel =
  mongoose.models.Template ?? mongoose.model("Template", templateModelSchema);
