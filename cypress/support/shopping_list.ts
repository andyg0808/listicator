function findItem(name: string) {
  return cy.contains(name).closest("li");
}

const checkbox = 'input[type="checkbox"]';

export function checkItem(name: string) {
  findItem(name).find(checkbox).check();
}

export function uncheckItem(name: string) {
  findItem(name).find(checkbox).uncheck();
}

export function checkListItem(item) {
  item.find(checkbox).check();
}
