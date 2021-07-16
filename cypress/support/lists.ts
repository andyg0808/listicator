import { checkItem, uncheckItem } from "./checkboxes";

export function findItem(elem, name: string) {
  return elem.closest("li");
}

export function checkListItem(elem, name: string) {
  return checkItem(findItem(elem, name));
}

export function uncheckListItem(elem, name: string) {
  return uncheckItem(findItem(elem, name));
}
