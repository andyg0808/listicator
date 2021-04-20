export function defined<T>(n: T | null | undefined): n is T {
  return n !== null && n !== undefined;
}
