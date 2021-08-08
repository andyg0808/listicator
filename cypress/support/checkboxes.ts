const checkbox = 'input[type="checkbox"]';

export function checkItem(item: Cypress.Chainable): Cypress.Chainable {
  return item.find(checkbox).check();
}

export function uncheckItem(item: Cypress.Chainable): Cypress.Chainable {
  return item.find(checkbox).check();
}

export function shouldBeChecked(item: Cypress.Chainable): Cypress.Chainable {
  return item.find(checkbox).should("be.checked");
}
export function shouldNotBeChecked(item: Cypress.Chainable): Cypress.Chainable {
  return item.find(checkbox).should("not.be.checked");
}
