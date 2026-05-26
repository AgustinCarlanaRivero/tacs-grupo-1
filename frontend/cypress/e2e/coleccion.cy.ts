/**
 * Tests E2E — Home / Mi Colección (/)
 *
 * Sin mocks — usa el back real con la colección de Ana del seed:
 *   Tiene: Emiliano Martinez (#23 REGULAR), Enzo Fernandez (#8 REGULAR), Messi (#10 SHINY)
 *   Falta: Julian Alvarez (#9 REGULAR), Kylian Mbappe (#12 SHINY)
 *
 * Solo assertamos sobre figuritas REGULAR (las SHINY no muestran nombre en el DOM).
 */
export {};

describe("Mi Colección", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("muestra el título de bienvenida", () => {
    cy.contains("¡Hola, Coleccionista!").should("be.visible");
  });

  it("muestra el subtítulo con la descripción", () => {
    cy.contains("Acá están tus figuritas del Mundial 2026.").should("be.visible");
  });

  it("muestra la sección Mi Colección", () => {
    cy.contains("Mi Colección").should("be.visible");
  });

  it("muestra la sección Figuritas Faltantes", () => {
    cy.contains("Figuritas Faltantes").should("be.visible");
  });

  it("muestra figuritas REGULAR de la colección de Ana (seed)", () => {
    // Emiliano Martinez (#23) y Enzo Fernandez (#8) son REGULAR → tienen nombre en el DOM
    cy.contains("Emiliano Martinez").should("be.visible");
    cy.contains("Enzo Fernandez").should("be.visible");
  });

  it("muestra figuritas faltantes REGULAR de Ana (seed)", () => {
    // Julian Alvarez (#9) es REGULAR → nombre visible en el DOM
    cy.contains("Julian Alvarez").should("be.visible");
  });
});
