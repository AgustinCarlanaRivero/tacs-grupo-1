/**
 * Tests E2E — Subastas (/auctions)
 *
 * Ana tiene: 1 subasta (Messi #10 — back devuelve sticker.type, no sticker.category,
 * por eso AuctionCard lo trata como Regular y muestra el nombre en el DOM).
 *
 * Tab "Mercado" siempre vacío desde el back real (solo devuelve posts propios).
 *
 * Patrón de espera:
 *   cy.intercept + cy.wait("@getPosts") antes de interactuar con tabs,
 *   para asegurarse de que React hidró el componente y los onClick están adjuntados.
 *
 * Solo el bloque "Con subastas en el mercado" usa mock porque la API no devuelve
 *   posts de otros usuarios.
 */
export {};

const API = "http://localhost:3000";
const POSTS_API = `${API}/users/*/posts*`;

describe("Subastas", () => {
  describe("Layout y navegación", () => {
    beforeEach(() => {
      cy.intercept("GET", POSTS_API).as("getPosts");
      cy.visit("/auctions");
      cy.wait("@getPosts");
    });

    it("muestra el título de la página", () => {
      cy.contains("Subastas").should("be.visible");
    });

    it("muestra la tab 'Mercado' activa por defecto", () => {
      cy.contains("button", "Mercado").should("be.visible");
    });

    it("muestra la tab 'Mis subastas' cuando está autenticado", () => {
      cy.contains("button", "Mis subastas").should("be.visible");
    });

    it("muestra el buscador", () => {
      cy.get("input[placeholder*='Buscar']").should("be.visible");
    });
  });

  describe("Tab Mercado (vacío — API solo devuelve posts propios)", () => {
    beforeEach(() => {
      cy.intercept("GET", POSTS_API).as("getPosts");
      cy.visit("/auctions");
      cy.wait("@getPosts");
    });

    it("muestra mensaje de vacío en el mercado", () => {
      cy.contains("No hay subastas activas.").should("be.visible");
    });

    it("muestra mensaje de no encontrado al buscar algo inexistente", () => {
      cy.get("input[placeholder*='Buscar']").type("xyzxyz123");
      cy.contains("No se encontraron subastas").should("be.visible");
    });
  });

  describe("Tab Mis subastas (datos reales del seed)", () => {
    beforeEach(() => {
      cy.intercept("GET", POSTS_API).as("getPosts");
      cy.visit("/auctions");
      cy.wait("@getPosts"); // esperar API antes de clickear el tab
      cy.contains("button", "Mis subastas").click();
    });

    it("muestra el botón '+ Publicar'", () => {
      cy.contains("+ Publicar").should("be.visible");
    });

    it("muestra la subasta de Messi de Ana (seed)", () => {
      cy.contains("Lionel Messi").should("be.visible");
    });

    it("muestra el botón 'Cancelar subasta' para la subasta propia", () => {
      cy.contains("Cancelar subasta").should("be.visible");
    });

    it("abre el modal 'Publicar subasta' al hacer clic en '+ Publicar'", () => {
      cy.contains("+ Publicar").click();
      cy.contains("Publicar subasta").should("be.visible");
    });

    it("cierra el modal al hacer clic en el botón X", () => {
      cy.contains("+ Publicar").click();
      cy.contains("h3", "Publicar subasta").should("be.visible");
      cy.contains("h3", "Publicar subasta").closest("div").siblings("button").click();
      cy.contains("h3", "Publicar subasta").should("not.exist");
    });
  });

  describe("Con subastas en el mercado (mock — limitación de API)", () => {
    beforeEach(() => {
      // Mockeamos porque la API solo devuelve posts propios,
      // no permite ver subastas de otros usuarios
      cy.intercept("GET", POSTS_API, {
        statusCode: 200,
        body: {
          data: [
            {
              id: "post-mock-1",
              type: "AUCTION",
              state: "ACTIVE",
              sticker: {
                id: 7,
                title: "#7 Rodrigo De Paul",
                state: "ACTIVE",
                type: "REGULAR",
                description: "",
                player: {
                  name: "Rodrigo De Paul",
                  nationalTeam: { name: "Argentina" },
                  club: { name: "Atletico Madrid" },
                  image: "",
                },
              },
              owner: { id: "seed-user-bruno", username: "brunod" },
              endsAt: new Date(Date.now() + 86400000).toISOString(),
              minimumRequirement: 1,
              minimumRequirements: [],
            },
          ],
          page: 1,
          limit: 20,
          total: 1,
        },
      }).as("getPostsMock");

      cy.visit("/auctions");
      cy.wait("@getPostsMock");
    });

    it("muestra la card de la subasta del mercado", () => {
      cy.contains("Rodrigo De Paul").should("be.visible");
    });

    it("muestra el botón 'Pujar' en subastas del mercado", () => {
      cy.contains("Pujar").should("be.visible");
    });

    it("abre el modal de oferta al hacer clic en Pujar", () => {
      cy.contains("Pujar").click();
      cy.contains("Participar en subasta").should("be.visible");
    });
  });
});
