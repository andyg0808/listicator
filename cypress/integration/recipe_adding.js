describe("Add a recipe", () => {
  const addRecipe = '[title="Add Recipe"]';
  const recipeTitle = '[data-test="Title"]';
  const recipeText = '[data-test="Editor"]';
  const viewer = '[data-test="Viewer"]';

  it("should include the recipe title", () => {
    cy.visit("http://localhost:3000/");
    cy.get(addRecipe).click();
    cy.get(recipeTitle).type("Come on and ketch up!");
    cy.get(recipeText).type("1/2 gallon ketchup");
    cy.get(viewer).contains("tr", "ketchup").as("ketchup");
    cy.get("@ketchup").contains("td", "1/2");
    cy.get("@ketchup").contains("td", "gallon");
    cy.get(recipeText).type("\n6 cubes ice");
    cy.contains("Save").click();

    cy.contains("Come on and ketch up");
  });
});
