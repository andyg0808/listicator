const tab = '[role="tab"]';

export function clickShopTab() {
  cy.contains(tab, "Shop").click();
}

export function clickBuildTab() {
  cy.contains(tab, "Build").click();
}
