import { Schema, Types, type SchemaDefinition, type SchemaOptions } from "mongoose";
import type { ZodObject, ZodRawShape } from "zod";
import { generateRawSchema } from "zod-to-mongoose";

export type TransformResult = Record<string, unknown>;
export type PersistenceId = Types.ObjectId | string;

export const createObjectIdString = () => new Types.ObjectId().toHexString();

export const toObjectId = (value: PersistenceId): Types.ObjectId => {
    if (value instanceof Types.ObjectId) {
        return value;
    }

    return new Types.ObjectId(value);
};

export const toIdString = (value: PersistenceId): string => {
    if (value instanceof Types.ObjectId) {
        return value.toHexString();
    }

    return value;
};

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
type SchemaInternals = Schema & {
    paths: Record<string, unknown>;
    nested: Record<string, unknown>;
    tree: Record<string, unknown>;
    singleNestedPaths?: Record<string, unknown>;
};

const buildNestedPath = (
    path: string,
    value: SchemaPathValue,
): SchemaDefinition => {
    return path
        .split(".")
        .reduceRight((acc, key) => ({ [key]: acc }), value) as SchemaDefinition;
};

const isPathOrChild = (key: string, path: string) =>
    key === path || key.startsWith(`${path}.`);

const deletePathEntries = (record: Record<string, unknown>, path: string) => {
    for (const key of Object.keys(record)) {
        if (isPathOrChild(key, path)) {
            delete record[key];
        }
    }
};

const deleteTreePath = (tree: Record<string, unknown>, path: string) => {
    const segments = path.split(".");
    const last = segments.pop();
    let branch: Record<string, unknown> | undefined = tree;

    for (const segment of segments) {
        const next = branch?.[segment];
        if (!next || typeof next !== "object") {
            return;
        }
        branch = next as Record<string, unknown>;
    }

    if (branch && last) {
        delete branch[last];
    }
};

export const overrideSchemaPath = (
    schema: Schema,
    path: string,
    value: SchemaPathValue,
) => {
    try {
        schema.remove(path);
    } catch {
        const schemaInternals = schema as SchemaInternals;

        deletePathEntries(schemaInternals.paths, path);
        deletePathEntries(schemaInternals.nested, path);
        if (schemaInternals.singleNestedPaths) {
            deletePathEntries(schemaInternals.singleNestedPaths, path);
        }
        deleteTreePath(schemaInternals.tree, path);
    }
    schema.add(buildNestedPath(path, value));
};
