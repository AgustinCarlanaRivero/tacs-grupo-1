/**
 * Tests E2E — Panel de Admin (/admin y /admin/users)
 *
 * Sin mocks — usa el back real con los datos del seed:
 *   Usuarios: admin (ADMIN), analopez, brunod, carlap (todos STANDARD)
 *   Top reputación: admin(4.9), analopez(4.6), brunod(4.2), carlap(3.8)
 *
 * La StatCard renderiza: icono → <span>valor</span> → <span>label</span>
 * Usamos .prev() sobre el label para obtener el span del número.
 */
export {};

describe("Panel de Administración", () => {
  describe("/admin — Dashboard", () => {
    beforeEach(() => {
      cy.visit("/admin");
    });

    it("muestra el título del panel", () => {
      cy.contains("Panel de Administración").should("be.visible");
    });

    it("muestra 4 usuarios en total (seed)", () => {
      // El primer "Total" en el DOM corresponde al total de usuarios (el de notificaciones viene después)
      // .prev() obtiene el <span> de valor que está justo antes del label
      cy.contains("Total").prev().should("contain", "4");
    });

    it("muestra 1 admin y 3 standard (seed)", () => {
      cy.contains("Admins").prev().should("contain", "1");
      cy.contains("Standard").prev().should("contain", "3");
    });

    it("muestra la sección de notificaciones", () => {
      cy.contains("Notificaciones").should("be.visible");
    });

    it("muestra el top de reputación con usuarios del seed", () => {
      cy.contains("Top reputación").should("be.visible");
      cy.contains("admin").should("be.visible");
      cy.contains("analopez").should("be.visible");
    });

    it("muestra el link a gestión de usuarios", () => {
      cy.contains("Gestión de usuarios").should("be.visible");
    });

    it("navega a /admin/users al hacer clic en Gestión de usuarios", () => {
      cy.contains("Gestión de usuarios").click();
      cy.url().should("include", "/admin/users");
    });
  });

  describe("/admin/users — Gestión de usuarios", () => {
    beforeEach(() => {
      cy.visit("/admin/users");
    });

    it("muestra el título de la página", () => {
      cy.contains("Gestión de usuarios").should("be.visible");
    });

    it("muestra el link para volver al panel", () => {
      cy.contains("Volver al panel").should("be.visible");
    });

    it("muestra el buscador", () => {
      cy.get("input[placeholder*='Buscar']").should("be.visible");
    });

    it("lista los 4 usuarios del seed", () => {
      cy.contains("admin").should("be.visible");
      cy.contains("analopez").should("be.visible");
      cy.contains("brunod").should("be.visible");
      cy.contains("carlap").should("be.visible");
    });

    it("muestra el badge ADMIN para el usuario admin", () => {
      cy.contains("ADMIN").should("be.visible");
    });

    it("muestra el badge STANDARD para usuarios estándar", () => {
      cy.contains("STANDARD").should("be.visible");
    });

    it("filtra usuarios al escribir en el buscador", () => {
      cy.get("input[placeholder*='Buscar']").type("bruno");
      cy.contains("brunod").should("be.visible");
      cy.contains("carlap").should("not.exist");
      cy.contains("analopez").should("not.exist");
    });

    it("muestra 'no encontrado' si la búsqueda no tiene resultados", () => {
      cy.get("input[placeholder*='Buscar']").type("zzznoencontrado");
      cy.contains("No se encontraron usuarios.").should("be.visible");
    });

    it("navega de vuelta a /admin al hacer clic en 'Volver al panel'", () => {
      cy.contains("Volver al panel").click();
      cy.url().should("include", "/admin");
      cy.url().should("not.include", "/users");
    });
  });
});
