import crypto from "node:crypto";
import { BadRequestError } from "../errors/http-errors";

/**
 * Token de un solo uso que ata un `chatId` de Telegram a una sesión de login del
 * front. Va firmado con HMAC-SHA256 e incluye una expiración corta para que no se
 * pueda atar un chat ajeno a una cuenta (ver `telegram-bot-plan.md` §4 y §12).
 *
 * Formato (antes de codificar): `<chatId>.<expiresAt>.<signature>`, todo envuelto
 * en base64url para que sea seguro en una URL.
 */

const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutos

function getSecret(): string {
    const secret =
        process.env.TELEGRAM_LINK_SECRET ?? process.env.TELEGRAM_BOT_TOKEN;
    if (!secret || secret.trim().length === 0) {
        throw new Error(
            "Falta TELEGRAM_LINK_SECRET (o TELEGRAM_BOT_TOKEN) para firmar el token de vinculación",
        );
    }
    return secret;
}

function sign(payload: string): string {
    return crypto
        .createHmac("sha256", getSecret())
        .update(payload)
        .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
}

/** Firma un token de vinculación para el `chatId` dado. */
export function signLinkToken(chatId: string): string {
    const expiresAt = Date.now() + TOKEN_TTL_MS;
    const payload = `${chatId}.${expiresAt}`;
    const token = `${payload}.${sign(payload)}`;
    return Buffer.from(token, "utf8").toString("base64url");
}

/**
 * Valida la firma y la expiración del token y devuelve el `chatId`.
 * Lanza `BadRequestError` si el token está mal formado, alterado o vencido.
 */
export function verifyLinkToken(token: string): { chatId: string } {
    let decoded: string;
    try {
        decoded = Buffer.from(token, "base64url").toString("utf8");
    } catch {
        throw new BadRequestError("Token de vinculación inválido");
    }

    const parts = decoded.split(".");
    if (parts.length !== 3) {
        throw new BadRequestError("Token de vinculación inválido");
    }

    const [chatId, expiresAtRaw, signature] = parts;
    const payload = `${chatId}.${expiresAtRaw}`;

    if (!safeEqual(signature, sign(payload))) {
        throw new BadRequestError("Token de vinculación inválido");
    }

    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
        throw new BadRequestError("El token de vinculación expiró");
    }

    return { chatId };
}

/**
 * Arma la URL del front que dispara el login y la vinculación, con el token en
 * el query string: `<FRONTEND_URL>/telegram?token=<token>`.
 */
export function buildLoginUrl(chatId: string): string {
    const base = (process.env.FRONTEND_URL ?? "").replace(/\/+$/, "");
    const token = signLinkToken(chatId);
    return `${base}/telegram?token=${encodeURIComponent(token)}`;
}
