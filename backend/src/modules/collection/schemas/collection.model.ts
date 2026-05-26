import { z } from "zod";
import {
    createMongooseSchema,
    overrideSchemaPath,
} from "../../../infra/database/schema-helpers";
import {
    stickerModelSchema,
    stickerPersistenceSchema,
} from "../../stickers/schemas/sticker.model";
import { Collection } from "../entities/collection.entity";
import {
    collectionItemResponseSchema,
    collectionResponseSchema,
} from "./collection.schemas";

export const collectionItemPersistenceSchema = collectionItemResponseSchema
    .omit({
        sticker: true,
    })
    .extend({
        sticker: stickerPersistenceSchema,
    });

export const collectionPersistenceSchema = collectionResponseSchema
    .omit({
        items: true,
        missingStickers: true,
    })
    .extend({
        items: z.array(collectionItemPersistenceSchema),
        missingStickers: z.array(stickerPersistenceSchema),
    });

export const collectionItemModelSchema = createMongooseSchema(
    collectionItemPersistenceSchema,
    {
        schemaOptions: { _id: false },
    },
);

overrideSchemaPath(collectionItemModelSchema, "sticker", stickerModelSchema);

export const collectionModelSchema = createMongooseSchema(
    collectionPersistenceSchema,
    {
        schemaOptions: { _id: false },
    },
);

overrideSchemaPath(collectionModelSchema, "items", [collectionItemModelSchema]);
overrideSchemaPath(collectionModelSchema, "missingStickers", [
    stickerModelSchema,
]);

collectionModelSchema.loadClass(Collection);
