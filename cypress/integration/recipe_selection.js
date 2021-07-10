import { ingredients } from "../support/default_recipe";
describe("Check a recipe", () => {
  const list = '[data-test^="StoreList"]';
  it("should add items to the lists when a recipe is checked", () => {
    cy.visit("http://localhost:3000/");
    cy.contains("Pizza Sauce").should("have.css", "cursor", "pointer").click();
    cy.contains(list, "Undecided").as("list");
    ingredients.forEach((desc) => {
      cy.get("@list").contains(desc);
    });
  });

  it("should support setting the number of items on a recipe", () => {
    cy.visit("http://localhost:3000/");
    cy.contains("Pizza Sauce").should("have.css", "cursor", "pointer").click();
    cy.contains(list, "Undecided").as("list");
    ingredients.forEach((desc) => {
      cy.get("@list").contains(desc);
    });
  });
});
