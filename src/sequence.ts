import { map } from "ramda";

export function moveItemsDown(
  record: Record<string, number>,
  idx: number
): Record<string, number> {
  return map((n) => (n > idx ? n + 1 : n), record);
}
