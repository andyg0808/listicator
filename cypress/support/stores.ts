export function addStore(name: string) {
  const configureStore = '[data-test^="Configure Stores"]';
  const newStore = '[data-test="New Store"]';
  const addStore = '[title^="Add store"]';
  cy.get(configureStore).click();
  cy.get(newStore).type(name);
  cy.get(addStore).click();
  cy.get(".MuiBackdrop-root").click();
}
