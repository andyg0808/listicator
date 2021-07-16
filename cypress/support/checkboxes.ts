const checkbox = 'input[type="checkbox"]';

export function checkItem(item) {
  return item.find(checkbox).check();
}

export function uncheckItem(item) {
  return item.find(checkbox).check();
}
