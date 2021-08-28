import { test, expect } from "@playwright/test";
import { BuildTab } from "./build_tab";

test.beforeEach(async ({ page }) => {
  const tab = new BuildTab(page);
  await tab.goto();
});

test.describe("Add a recipe", () => {
  const addRecipe = '[title="Add Recipe"]';
  const recipeTitle = '[data-test="Title"]';
  const recipeText = '[data-test="Editor"]';
  const viewer = '[data-test="Viewer"]';

  test("should include the recipe title", async ({ page }) => {
    const tab = new BuildTab(page);
    tab.goto();
    const addRecipe = tab.addRecipe();
    cy.get(recipeTitle).type("Come on and ketch up!");
    cy.get(recipeText).type("1/2 gallon ketchup");
    cy.get(viewer).contains("tr", "ketchup").as("ketchup");
    cy.get("@ketchup").contains("td", "1/2");
    cy.get("@ketchup").contains("td", "gallon");
    cy.get(recipeText).type("\n6 cubes ice");
    cy.get(viewer).contains("tr", "ice").as("ice");
    cy.get("@ice").contains("td", "6");
    cy.get("@ice").contains("td", "cubes");
    cy.contains("Save").click();

    cy.contains("Come on and ketch up");
  });

  test("should accept list forms", () => {
    cy.visit("http://localhost:3000/");
    cy.get(addRecipe).click();
    cy.get(recipeText).type("- 1/2 gallon ketchup");
    cy.get(viewer).contains("tr", "ketchup").as("ketchup");
    cy.get("@ketchup").contains("td", "1/2");
    cy.get("@ketchup").contains("td", "gallon");
  });

  test("should offer similar ingredients to switch to", () => {});
});
