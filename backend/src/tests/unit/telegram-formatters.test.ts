import { describe, expect, test } from "@jest/globals";
import { NotificationType } from "../../modules/notifications/enums/notification-type.enum";
import { formatNotificationsPage } from "../../modules/notifications/telegram/notification.formatter";
import { PostState } from "../../modules/posts/enums/post-state.enum";
import { PostType } from "../../modules/posts/enums/post-type.enum";
import {
    formatPostsPage,
    formatStickerDetail,
    type PostsPage,
} from "../../modules/posts/telegram/post.formatter";
import {
    hasNextPage,
    pagerKeyboard,
    totalPages,
} from "../../shared/utils/telegram-pagination";
import { buildNotification, buildSticker } from "../helpers/builders";

const buildPostsPage = (overrides: Partial<PostsPage> = {}): PostsPage => ({
    data: [
        {
            id: "p1",
            type: PostType.DIRECT_TRADE,
            state: PostState.ACTIVE,
            sticker: {
                number: 10,
                state: "NEW",
                type: "REGULAR",
                description: "",
                player: {
                    name: "Messi",
                    nationalTeam: { name: "Argentina" },
                    club: { name: "Inter Miami" },
                    image: "",
                },
            },
            owner: { id: "u1", username: "ana" },
        },
    ],
    total: 1,
    page: 1,
    limit: 5,
    ...overrides,
});

describe("post.formatter", () => {
    test("formatPostsPage muestra publicaciones con encabezado y total", () => {
        const text = formatPostsPage(buildPostsPage(), "📋 Publicaciones");
        expect(text).toContain("📋 Publicaciones");
        expect(text).toContain("página 1/1 · 1 en total");
        expect(text).toContain("#10 Messi");
        expect(text).toContain("@ana");
        expect(text).toContain("Intercambio directo");
    });

    test("formatPostsPage avisa cuando no hay publicaciones", () => {
        const text = formatPostsPage(
            buildPostsPage({ data: [], total: 0 }),
            "📋 Publicaciones",
        );
        expect(text).toContain("No hay publicaciones");
    });

    test("formatStickerDetail incluye jugador, club y estado", () => {
        const sticker = buildSticker(7, {
            playerName: "Di María",
            clubName: "Benfica",
            teamName: "Argentina",
            type: "SHINY",
        });
        const text = formatStickerDetail(sticker);
        expect(text).toContain("#7 Di María");
        expect(text).toContain("Club: Benfica");
        expect(text).toContain("Selección: Argentina");
        expect(text).toContain("Brillante");
    });
});

describe("notification.formatter", () => {
    test("formatNotificationsPage lista notificaciones con su etiqueta", () => {
        const items = [
            buildNotification("n1", "u1", {
                type: NotificationType.OFFER_RECEIVED,
                message: "Tenés una oferta nueva",
            }),
        ];
        const text = formatNotificationsPage(items, 1, 5);
        expect(text).toContain("Oferta recibida");
        expect(text).toContain("Tenés una oferta nueva");
        expect(text).toContain("1 sin leer");
    });

    test("formatNotificationsPage avisa cuando no hay nada sin leer", () => {
        const text = formatNotificationsPage([], 1, 5);
        expect(text).toContain("al día");
    });
});

describe("pagination", () => {
    test("totalPages y hasNextPage calculan según total/limit", () => {
        expect(totalPages({ total: 12, page: 1, limit: 5 })).toBe(3);
        expect(totalPages({ total: 0, page: 1, limit: 5 })).toBe(1);
        expect(hasNextPage({ total: 12, page: 1, limit: 5 })).toBe(true);
        expect(hasNextPage({ total: 12, page: 3, limit: 5 })).toBe(false);
    });

    test("pagerKeyboard ofrece solo 'Siguiente' en la primera página", () => {
        const kb = pagerKeyboard(
            { total: 12, page: 1, limit: 5 },
            (p) => `pub:${p}`,
        );
        const buttons = kb?.inline_keyboard[0] ?? [];
        expect(buttons).toHaveLength(1);
        expect(buttons[0]).toMatchObject({ callback_data: "pub:2" });
    });

    test("pagerKeyboard ofrece 'Anterior' y 'Siguiente' en páginas intermedias", () => {
        const kb = pagerKeyboard(
            { total: 12, page: 2, limit: 5 },
            (p) => `pub:${p}`,
        );
        const data = (kb?.inline_keyboard[0] ?? []).map(
            (b) => (b as { callback_data: string }).callback_data,
        );
        expect(data).toEqual(["pub:1", "pub:3"]);
    });

    test("pagerKeyboard ofrece solo 'Anterior' en la última página", () => {
        const kb = pagerKeyboard(
            { total: 12, page: 3, limit: 5 },
            (p) => `pub:${p}`,
        );
        const buttons = kb?.inline_keyboard[0] ?? [];
        expect(buttons).toHaveLength(1);
        expect(buttons[0]).toMatchObject({ callback_data: "pub:2" });
    });

    test("pagerKeyboard no muestra teclado con una sola página", () => {
        expect(
            pagerKeyboard({ total: 3, page: 1, limit: 5 }, (p) => `pub:${p}`),
        ).toBeUndefined();
    });
});
