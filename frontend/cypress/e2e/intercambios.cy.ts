/**
 * Tests E2E — Intercambios (/trades)
 *
 * Ana tiene 2 intercambios (seed): Rodrigo De Paul (#7 REGULAR), Enzo Fernandez (#8 REGULAR).
 * Tab "Mercado" siempre vacío desde el back real (solo devuelve posts propios).
 *
 * Patrón de espera:
 *   cy.intercept + cy.wait("@getPosts") antes de interactuar con tabs,
 *   para asegurarse de que React hidró el componente y los onClick están adjuntados.
 *
 * Tab "Sugerencias" usa cy.visit("/trades?tab=suggestions") porque el componente
 *   lee el query param en el useState inicial, evitando el click.
 */
export {};

const POSTS_API = "http://localhost:3000/users/*/posts*";

describe("Intercambios", () => {
  describe("Layout y tabs", () => {
    beforeEach(() => {
      cy.intercept("GET", POSTS_API).as("getPosts");
      cy.visit("/trades");
      cy.wait("@getPosts");
    });

    it("muestra el título de la página", () => {
      cy.contains("Intercambios").should("be.visible");
    });

    it("muestra las tres tabs cuando está autenticado", () => {
      cy.contains("button", "Mercado").should("be.visible");
      cy.contains("button", "Mis intercambios").should("be.visible");
      cy.contains("button", "Sugerencias").should("be.visible");
    });

    it("muestra el buscador en la tab Mercado por defecto", () => {
      cy.get("input[placeholder*='Buscar']").should("be.visible");
    });
  });

  describe("Tab Mercado (vacío — API solo devuelve posts propios)", () => {
    beforeEach(() => {
      cy.intercept("GET", POSTS_API).as("getPosts");
      cy.visit("/trades");
      cy.wait("@getPosts");
    });

    it("muestra mensaje de vacío en el mercado", () => {
      cy.contains("No hay intercambios disponibles.").should("be.visible");
    });

    it("muestra mensaje de no encontrado al buscar algo inexistente", () => {
      cy.get("input[placeholder*='Buscar']").type("xyzxyz123");
      cy.contains("No se encontraron figuritas").should("be.visible");
    });
  });

  describe("Tab Mis intercambios (datos reales del seed)", () => {
    beforeEach(() => {
      cy.intercept("GET", POSTS_API).as("getPosts");
      cy.visit("/trades");
      cy.wait("@getPosts"); // esperar API antes de clickear el tab
      cy.contains("button", "Mis intercambios").click();
    });

    it("muestra el botón '+ Publicar'", () => {
      cy.contains("+ Publicar").should("be.visible");
    });

    it("muestra los intercambios de Ana del seed (REGULAR → nombre visible)", () => {
      cy.contains("Rodrigo De Paul").should("be.visible");
      cy.contains("Enzo Fernandez").should("be.visible");
    });

    it("abre el modal 'Publicar intercambio' al hacer clic en '+ Publicar'", () => {
      cy.contains("+ Publicar").click();
      cy.contains("Publicar intercambio").should("be.visible");
    });

    it("cierra el modal al hacer clic en el botón X", () => {
      cy.contains("+ Publicar").click();
      cy.contains("h3", "Publicar intercambio").should("be.visible");
      cy.contains("h3", "Publicar intercambio").closest("div").siblings("button").click();
      cy.contains("h3", "Publicar intercambio").should("not.exist");
    });
  });

  describe("Tab Sugerencias", () => {
    // Usamos ?tab=suggestions para evitar el race condition de click post-hidratación.
    // El componente lee searchParams en el useState inicial y arranca directo en ese tab.
    beforeEach(() => {
      cy.visit("/trades?tab=suggestions");
    });

    it("no muestra el buscador en la tab Sugerencias", () => {
      cy.get("input[placeholder*='Buscar']").should("not.exist");
    });

    it("muestra las sugerencias del mock local", () => {
      // El <p> tiene CSS uppercase pero el texto del DOM es en minúsculas
      cy.contains("sugerencias disponibles").should("be.visible");
    });
  });
});
