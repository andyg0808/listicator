import { checkItem, uncheckItem } from "./checkboxes";

export function findItem(
  elem: Cypress.Chainable,
  name: string
): Cypress.Chainable {
  return elem.closest("li");
}

export function checkListItem(
  elem: Cypress.Chainable,
  name: string
): Cypress.Chainable {
  return checkItem(findItem(elem, name));
}

export function uncheckListItem(
  elem: Cypress.Chainable,
  name: string
): Cypress.Chainable {
  return uncheckItem(findItem(elem, name));
}
