import { type PartialDeep } from 'type-fest';
import isPlainObject from './isPlainObject';

function extractRequestFromActionRecursiveInternal<T extends Record<string, unknown>>(
  action: T
): PartialDeep<T> | undefined {
  let isEmpty = true;
  const inputEntries: Map<string, unknown> = new Map();

  for (const [key, value] of Object.entries(action)) {
    if (key.endsWith('-input')) {
      const valueKey = key.slice(0, -6);

      inputEntries.set(valueKey, action[valueKey]);
      isEmpty = false;
    } else if (!key.endsWith('-output') && isPlainObject(value)) {
      const subValue = extractRequestFromActionRecursiveInternal(value);

      if (typeof subValue !== 'undefined') {
        inputEntries.set(key, subValue);
        isEmpty = false;
      }
    }
  }

  return isEmpty ? undefined : (Object.fromEntries(inputEntries) as PartialDeep<T>);
}

export default function extractRequestFromActionRecursive<T extends Record<string, unknown>>(
  action: T
): PartialDeep<T> {
  return extractRequestFromActionRecursiveInternal(action) || ({} as PartialDeep<T>);
}
