import { type ReadonlyDeep } from 'type-fest';

import isPlainObject from './isPlainObject';

export default function omitInputOutputDeep<T extends Record<string, unknown>>(
  object: T
): ReadonlyDeep<T & Record<`${string}-input`, never>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};

  for (const [key, value] of Object.entries(object)) {
    if (!key.endsWith('-input') && !key.endsWith('-output')) {
      result[key] = isPlainObject(value) ? omitInputOutputDeep(value) : value;
    }
  }

  return Object.freeze(result);
}
