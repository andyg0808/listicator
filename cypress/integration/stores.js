import { randomName } from "../support/default_recipe";
import fc from "fast-check";

describe("Stores", () => {
  const list = (name) => `[data-test="StoreList-${name}"]`;
  const anyList = `[data-test^="StoreList"]`;
  const configureStore = '[title="Configure Stores"]';
  const addStore = '[title="Add store"]';
  const newStore = '[data-test="New Store"]';

  it("should allow the user to add new stores", () => {
    cy.visit("http://localhost:3000/");
    cy.get(configureStore).click();
    const storeNames = fc.sample(fc.string({ minLength: 1 }), 10);
    storeNames.forEach((store) => {
      cy.get(newStore).type(store);
      cy.get(addStore).click();
    });
    // TODO: Add proper dismiss button
    cy.get(".MuiBackdrop-root").click();
    storeNames.forEach((store) => {
      cy.contains(anyList, store);
    });
  });

  xit("should allow the user to drag and drop", () => {
    cy.contains("Pizza Sauce").click();
    const name = randomName();
    cy.get(list("Undecided"))
      .contains(name)
      .drag(list("Food Store"), { position: "center" });
  });
});
