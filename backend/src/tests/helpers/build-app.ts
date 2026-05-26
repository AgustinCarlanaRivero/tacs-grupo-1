import type { Express } from "express";

let cachedApp: Express | null = null;

export const setMockUser = (id: string, role: "STANDARD" | "ADMIN" = "STANDARD") => {
    process.env.MOCK_USER_ID = id;
    process.env.MOCK_USER_ROLE = role;
};

export const getTestApp = async (): Promise<Express> => {
    if (cachedApp) return cachedApp;

    process.env.DISABLE_AUTH = "true";
    if (!process.env.MOCK_USER_ID) process.env.MOCK_USER_ID = "test-user";
    if (!process.env.MOCK_USER_ROLE) process.env.MOCK_USER_ROLE = "STANDARD";

    const mod = await import("../../app/app");
    cachedApp = mod.default;
    return cachedApp;
};
