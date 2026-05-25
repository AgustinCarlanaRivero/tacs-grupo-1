import { Schema, type SchemaDefinition, type SchemaOptions } from "mongoose";
import type { ZodObject, ZodRawShape } from "zod";
import { generateRawSchema } from "zod-to-mongoose";

export type TransformResult = Record<string, unknown>;

type SchemaConfig = {
    schemaOptions?: SchemaOptions;
    omitPaths?: string[];
};

const applyBaseTransform = (ret: TransformResult, omitPaths: string[] = []) => {
    if ("_id" in ret) {
        ret.id = ret._id;
        delete ret._id;
    }

    if ("__v" in ret) {
        delete ret.__v;
    }

    for (const path of omitPaths) {
        if (path in ret) {
            delete ret[path];
        }
    }

    return ret;
};

export const createMongooseSchema = <T extends ZodRawShape>(
    schema: ZodObject<T>,
    config: SchemaConfig = {},
) => {
    const rawSchema = generateRawSchema({ schema });
    const mongooseSchema = new Schema(rawSchema, {
        versionKey: false,
        ...config.schemaOptions,
    });

    const transformHandler = (_doc: unknown, ret: TransformResult) =>
        applyBaseTransform(ret, config.omitPaths);

    mongooseSchema.set("toJSON", {
        transform: transformHandler,
        virtuals: true,
    });
    mongooseSchema.set("toObject", {
        transform: transformHandler,
        virtuals: true,
    });

    return mongooseSchema;
};

type EmbeddedSchemaOptions = {
    clazz?: new (...args: never[]) => unknown;
};

const resolveEmbeddedSchema = (schema: Schema, path: string) => {
    const segments = path.split(".");
    let currentSchema = schema;

    for (const segment of segments) {
        const schemaType = currentSchema.path(segment) as
            | { schema?: Schema; caster?: { schema?: Schema } }
            | undefined;
        if (!schemaType) return undefined;

        const nextSchema = schemaType.schema ?? schemaType.caster?.schema;
        if (!nextSchema) return undefined;

        currentSchema = nextSchema;
    }

    return currentSchema;
};

export const configureEmbeddedSchema = (
    schema: Schema,
    path: string,
    options: EmbeddedSchemaOptions = {},
) => {
    const targetSchema = resolveEmbeddedSchema(schema, path);
    if (!targetSchema) return;

    targetSchema.set("_id", false);
    targetSchema.set("versionKey", false);
    if (targetSchema.path("_id")) {
        targetSchema.remove("_id");
    }

    if (options.clazz) {
        targetSchema.loadClass(options.clazz);
    }
};

type SchemaPathValue = Schema | Schema[] | SchemaDefinition;

const buildNestedPath = (
    path: string,
    value: SchemaPathValue,
): SchemaDefinition => {
    return path
        .split(".")
        .reduceRight((acc, key) => ({ [key]: acc }), value) as SchemaDefinition;
};

export const overrideSchemaPath = (
    schema: Schema,
    path: string,
    value: SchemaPathValue,
) => {
    schema.remove(path);
    schema.add(buildNestedPath(path, value));
};
