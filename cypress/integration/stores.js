import { randomName } from "../support/default_recipe";
import fc from "fast-check";
import { addStore } from "../support/stores";

describe("Stores", () => {
  const list = (name) => `[data-test="StoreList-${name}"]`;
  const anyList = `[data-test^="StoreList"]`;

  it("should allow the user to add new stores", () => {
    cy.visit("http://localhost:3000/");
    const storeNames = fc.sample(
      fc.string({ minLength: 1 }).filter((s) => s !== "\\" && s !== ""),
      10
    );
    storeNames.forEach((store) => {
      addStore(store);
    });
    // TODO: Add proper dismiss button
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
