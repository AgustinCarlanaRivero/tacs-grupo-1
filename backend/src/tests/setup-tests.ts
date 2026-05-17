import { jest } from "@jest/globals";

jest.mock("../infra/swagger/swagger.routes", () => {
    const express = jest.requireActual("express") as typeof import("express");
    return {
        __esModule: true,
        default: express.Router(),
    };
});
