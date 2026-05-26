/**
 * Tests E2E de autenticación.
 *
 * Corren con NEXT_PUBLIC_DISABLE_AUTH=true, por lo que el usuario
 * ya está autenticado como "Ana Lopez" (ADMIN, seed-user-ana) sin pasar por Auth0.
 */

export {};

describe("Autenticación", () => {
  describe("Usuario autenticado (modo dev)", () => {
    it("muestra el nombre del usuario en el header", () => {
      cy.visit("/");
      cy.contains("Ana Lopez").should("be.visible");
    });

    it("muestra el botón Salir en el header", () => {
      cy.visit("/");
      cy.contains("Salir").should("be.visible");
    });

    it("NO muestra el botón Iniciar Sesión cuando está autenticado", () => {
      cy.visit("/");
      cy.contains("Iniciar Sesión").should("not.exist");
    });

    it("muestra el link de Admin en el nav porque el rol es ADMIN", () => {
      cy.visit("/");
      cy.contains("Admin").should("be.visible");
    });
  });

  describe("Rutas protegidas con RequireAuth", () => {
    it("permite acceder a /auctions sin redirigir", () => {
      cy.visitProtected("/auctions");
      cy.contains("Subastas").should("be.visible");
    });

    it("permite acceder a /trades sin redirigir", () => {
      cy.visitProtected("/trades");
      cy.contains("Intercambios").should("be.visible");
    });

    it("permite acceder a /profile sin redirigir", () => {
      cy.visitProtected("/profile");
      cy.url().should("include", "/profile");
    });

    it("permite acceder a /admin sin redirigir (es ADMIN)", () => {
      cy.visitProtected("/admin");
      cy.url().should("include", "/admin");
    });
  });

  describe("Navegación entre páginas", () => {
    it("navega a Subastas desde el header", () => {
      cy.visit("/");
      cy.get("nav").contains("Subastas").click();
      cy.url().should("include", "/auctions");
    });

    it("navega a Intercambios desde el header", () => {
      cy.visit("/");
      cy.get("nav").contains("Intercambios").click();
      cy.url().should("include", "/trades");
    });
  });
});
