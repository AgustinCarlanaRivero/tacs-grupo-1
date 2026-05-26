// Comandos custom de Cypress para este proyecto.
// Con DISABLE_AUTH=true el usuario ya está autenticado como Dev User (ADMIN),
// así que no hace falta simular el login de Auth0.

export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Navega a una ruta protegida y verifica que cargue sin redirigir a /login.
       * Útil en modo dev con DISABLE_AUTH=true.
       */
      visitProtected(path: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("visitProtected", (path: string) => {
  cy.visit(path);
  cy.url().should("not.include", "/login");
});
