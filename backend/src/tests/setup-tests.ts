import { jest } from "@jest/globals";

jest.mock("../infra/swagger/swagger.routes", () => {
    const express = jest.requireActual("express") as typeof import("express");
    return {
        __esModule: true,
        default: express.Router(),
    };
});

/**
 * `overrideSchemaPath` crashea al cargar `collection.model.ts` por una
 * interacción entre `zod-to-mongoose` y `Schema.remove`. Como en todos los
 * integration tests mockeamos los repos, los models reales nunca se usan en
 * runtime — sólo necesitamos que sus archivos carguen sin tirar.
 */
jest.mock("../infra/database/schema-helpers", () => {
    const actual = jest.requireActual(
        "../infra/database/schema-helpers",
    ) as typeof import("../infra/database/schema-helpers");
    return {
        ...actual,
        overrideSchemaPath: () => undefined,
    };
});
