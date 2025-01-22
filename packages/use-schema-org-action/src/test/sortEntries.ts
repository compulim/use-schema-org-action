/* istanbul ignore file */

export default function sortEntries<T>(entries: Iterable<[string, T]>): [string, T][] {
  return Array.from(entries).sort(([x], [y]) => (x > y ? 1 : x < y ? -1 : 0));
}
