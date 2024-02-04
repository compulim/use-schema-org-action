import { type ReadonlyDeep } from 'type-fest';

export default function mapToObjectDeep(map: ReadonlyMap<string, unknown>): ReadonlyDeep<Record<string, unknown>> {
  return Object.freeze(
    Object.fromEntries(
      Array.from(map.entries()).map(([key, value]) => [key, value instanceof Map ? mapToObjectDeep(value) : value])
    )
  );
}
