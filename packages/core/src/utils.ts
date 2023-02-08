export function deepCloneState<T>(state: T): T {
  return JSON.parse(JSON.stringify(state));
}
