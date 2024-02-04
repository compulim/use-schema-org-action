import mapToObjectDeep from './mapToObjectDeep';
import objectToMapDeep from './objectToMapDeep';

function mergeDeepCore(source: Map<string, unknown>, merging: Map<string, unknown>): Map<string, unknown> {
  const next: Map<string, unknown> = new Map(source);

  for (const [key, value] of merging.entries()) {
    if (value instanceof Map) {
      const sourceValue = merging.get(key);

      next.set(key, mergeDeepCore(sourceValue instanceof Map ? sourceValue : new Map(), value));
    } else {
      next.set(key, value);
    }
  }

  return next;
}

export default function mergeDeep(
  source: Record<string, unknown>,
  merging: Record<string, unknown>
): Record<string, unknown> {
  return mapToObjectDeep(mergeDeepCore(objectToMapDeep(source), objectToMapDeep(merging)));
}
