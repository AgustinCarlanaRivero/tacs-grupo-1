import {
    afterEach,
    beforeEach,
    describe,
    expect,
    jest,
    test,
} from "@jest/globals";
import { BadRequestError } from "../../shared/errors/http-errors";
import {
    buildLoginUrl,
    signLinkToken,
    verifyLinkToken,
} from "../../shared/utils/link-token";

const ORIGINAL_ENV = process.env;

beforeEach(() => {
    process.env = {
        ...ORIGINAL_ENV,
        TELEGRAM_LINK_SECRET: "test-secret",
        FRONTEND_URL: "https://front.example",
    };
});

afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.useRealTimers();
});

describe("link-token", () => {
    test("firma y valida un token devolviendo el chatId", () => {
        const token = signLinkToken("12345");
        expect(verifyLinkToken(token)).toEqual({ chatId: "12345" });
    });

    test("rechaza un token alterado", () => {
        const token = signLinkToken("12345");
        const tampered = (token[0] === "A" ? "B" : "A") + token.slice(1);
        expect(() => verifyLinkToken(tampered)).toThrow(BadRequestError);
    });

    test("rechaza un token vencido", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-01-01T00:00:00Z"));
        const token = signLinkToken("12345");

        jest.setSystemTime(new Date("2026-01-01T00:20:00Z"));
        expect(() => verifyLinkToken(token)).toThrow(/expir/i);
    });

    test("rechaza un token con formato inválido", () => {
        expect(() => verifyLinkToken("no-es-un-token")).toThrow(BadRequestError);
    });

    test("buildLoginUrl arma la URL del front con un token válido", () => {
        const url = buildLoginUrl("777");
        expect(url.startsWith("https://front.example/telegram?token=")).toBe(
            true,
        );

        const token = decodeURIComponent(url.split("token=")[1]);
        expect(verifyLinkToken(token)).toEqual({ chatId: "777" });
    });
});
