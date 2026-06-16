import { describe, expect, test } from "@jest/globals";
import { NotificationType } from "../../modules/notifications/enums/notification-type.enum";
import { formatNotificationsPage } from "../../modules/notifications/telegram/notification.formatter";
import { PostState } from "../../modules/posts/enums/post-state.enum";
import { PostType } from "../../modules/posts/enums/post-type.enum";
import {
    formatOffersPage,
    formatPostsPage,
    formatStickerDetail,
    type OffersPage,
    type PostsPage,
} from "../../modules/posts/telegram/post.formatter";
import { formatSuggestionsPage } from "../../modules/matching/telegram/matching.formatter";
import {
    formatProfile,
    type RatingsPage,
} from "../../modules/users/telegram/user.formatter";
import { formatTemplatesPage } from "../../modules/templates/telegram/template.formatter";
import { Template } from "../../modules/templates/entities/template.entity";
import {
    hasNextPage,
    pagerKeyboard,
    totalPages,
} from "../../shared/utils/telegram-pagination";
import { buildNotification, buildSticker, buildUser } from "../helpers/builders";

const buildPostsPage = (overrides: Partial<PostsPage> = {}): PostsPage => ({
    data: [
        {
            id: "p1",
            type: PostType.DIRECT_TRADE,
            state: PostState.ACTIVE,
            quantity: 1,
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

    test("formatPostsPage agrega la cantidad de ofertas cuando se pasa el mapa", () => {
        const withOffers = formatPostsPage(
            buildPostsPage(),
            "📋 Publicaciones",
            new Map([["p1", 2]]),
        );
        expect(withOffers).toContain("💬 2 ofertas");

        const withoutOffers = formatPostsPage(
            buildPostsPage(),
            "📋 Publicaciones",
            new Map([["p1", 0]]),
        );
        expect(withoutOffers).toContain("sin ofertas");
    });
});

describe("offers.formatter", () => {
    const buildOffersPage = (overrides: Partial<OffersPage> = {}): OffersPage =>
        ({
            data: [
                {
                    id: "o1",
                    state: "PENDING",
                    createdAt: new Date(),
                    offerer: { id: "u2", username: "pedro" },
                    offered: [
                        {
                            sticker: { number: 5, player: { name: "Mbappé" } },
                            quantity: 1,
                        },
                        {
                            sticker: { number: 8, player: { name: "Neymar" } },
                            quantity: 2,
                        },
                    ],
                    postId: "p1",
                    postOwnerId: "u1",
                },
            ],
            total: 1,
            page: 1,
            limit: 5,
            ...overrides,
        }) as unknown as OffersPage;

    test("formatOffersPage lista oferente, figuritas y estado", () => {
        const text = formatOffersPage(buildOffersPage(), 10);
        expect(text).toContain("figurita #10");
        expect(text).toContain("@pedro");
        expect(text).toContain("#5 Mbappé");
        expect(text).toContain("#8 Neymar (x2)");
        expect(text).toContain("Pendiente");
    });

    test("formatOffersPage avisa cuando no hay ofertas", () => {
        const text = formatOffersPage(
            buildOffersPage({ data: [], total: 0 }),
            10,
        );
        expect(text).toContain("Todavía no tiene ofertas");
    });
});

describe("matching.formatter", () => {
    test("formatSuggestionsPage lista usuario y figuritas que puede dar", () => {
        const text = formatSuggestionsPage({
            data: [
                {
                    userId: "u2",
                    username: "pedro",
                    offerableStickers: [
                        { number: 5, title: "#5 Mbappé" },
                        { number: 8, title: "#8 Neymar" },
                    ],
                },
            ],
            total: 1,
            page: 1,
            limit: 5,
        });
        expect(text).toContain("Sugerencias de intercambio");
        expect(text).toContain("@pedro");
        expect(text).toContain("#5 Mbappé");
    });

    test("formatSuggestionsPage avisa cuando no hay sugerencias", () => {
        const text = formatSuggestionsPage({
            data: [],
            total: 0,
            page: 1,
            limit: 5,
        });
        expect(text).toContain("No encontramos");
    });
});

describe("user.formatter (perfil)", () => {
    const buildRatingsPage = (
        overrides: Partial<RatingsPage> = {},
    ): RatingsPage => ({
        data: [
            {
                id: "r1",
                reviewerId: "u2",
                revieweeId: "u1",
                score: 5,
                comment: "Excelente intercambio",
                createdAt: new Date(),
            },
        ],
        total: 1,
        page: 1,
        limit: 5,
        ...overrides,
    });

    test("formatProfile muestra datos y reseñas con estrellas", () => {
        const user = buildUser("u1");
        user.reputation = 4.5;
        const text = formatProfile(user, buildRatingsPage());
        expect(text).toContain("Tu perfil");
        expect(text).toContain("@u1");
        expect(text).toContain("★★★★★");
        expect(text).toContain("Excelente intercambio");
        expect(text).toContain("4.5");
    });

    test("formatProfile avisa cuando no hay reseñas", () => {
        const user = buildUser("u1");
        const text = formatProfile(
            user,
            buildRatingsPage({ data: [], total: 0 }),
        );
        expect(text).toContain("Todavía no recibiste reseñas");
        expect(text).toContain("sin calificaciones");
    });
});

describe("template.formatter", () => {
    test("formatTemplatesPage lista nombre y figurita de cada plantilla", () => {
        const template = new Template(
            "Messi NEW",
            buildSticker(10, { playerName: "Messi", teamName: "Argentina" }),
            "u1",
        );
        const text = formatTemplatesPage([template], 1, 5);
        expect(text).toContain("Tus plantillas");
        expect(text).toContain('"Messi NEW"');
        expect(text).toContain("#10 Messi");
        expect(text).toContain("Argentina");
        expect(text).toContain("Nueva");
    });

    test("formatTemplatesPage avisa cuando no hay plantillas", () => {
        const text = formatTemplatesPage([], 1, 5);
        expect(text).toContain("Todavía no tenés plantillas");
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
