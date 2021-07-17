import {
  checkItem,
  uncheckItem,
  shouldBeChecked,
  shouldNotBeChecked,
} from "./checkboxes";

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

export function listItemShouldBeChecked(
  elem: Cypress.Chainable,
  name: string
): Cypress.Chainable {
  return shouldBeChecked(findItem(elem, name));
}

export function listItemShouldNotBeChecked(
  elem: Cypress.Chainable,
  name: string
): Cypress.Chainable {
  return shouldNotBeChecked(findItem(elem, name));
}
