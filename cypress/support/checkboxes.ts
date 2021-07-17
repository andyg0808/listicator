const checkbox = 'input[type="checkbox"]';

export function checkItem(item: Cypress.Chainable): Cypress.Chainable {
  return item.find(checkbox).check();
}

export function uncheckItem(item: Cypress.Chainable): Cypress.Chainable {
  return item.find(checkbox).check();
}
