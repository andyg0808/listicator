import { markDefaultRecipe, ingredients } from "../support/default_recipe";
import { addStore } from "../support/stores";

describe("List builder", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
    markDefaultRecipe();
    addStore("Basic");
    addStore("Second");
  });

  xit("should allow clicking on a list item to select it", () => {
    cy.contains("h2", "Undecided").next().as("undecided_list");
    const shuffled = Cypress._.shuffle(ingredients);
    const [basic, second, undecided] = Cypress._.chunk(
      shuffled,
      shuffled.length / 3
    );
    ingredients.forEach((desc) => {
      cy.get("@undecided_list").contains(desc);
    });
  });
});
