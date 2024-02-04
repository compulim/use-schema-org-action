import { type ReadonlyDeep } from 'type-fest';

import mapToObjectDeep from './mapToObjectDeep';
import objectToMapDeep from './objectToMapDeep';

function mergeDeepCore(
  source: ReadonlyMap<string, unknown>,
  merging: ReadonlyMap<string, unknown>
): ReadonlyMap<string, unknown> {
  const next: Map<string, unknown> = new Map(source);

  for (const [key, value] of merging.entries()) {
    if (value instanceof Map) {
      const sourceValue = source.get(key);

      next.set(key, mergeDeepCore(sourceValue instanceof Map ? sourceValue : new Map(), value));
    } else {
      next.set(key, value);
    }
  }

  return next;
}

export default function mergeDeep(
  source: ReadonlyDeep<Record<string, unknown>>,
  merging: ReadonlyDeep<Record<string, unknown>>
): ReadonlyDeep<Record<string, unknown>> {
  return mapToObjectDeep(mergeDeepCore(objectToMapDeep(source), objectToMapDeep(merging)));
}
