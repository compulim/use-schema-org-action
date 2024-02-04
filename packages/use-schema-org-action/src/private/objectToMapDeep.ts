import { type ReadonlyDeep } from 'type-fest';

import isPlainObject from './isPlainObject';

export default function objectToMapDeep(object: ReadonlyDeep<Record<string, unknown>>): ReadonlyMap<string, unknown> {
  return Object.freeze(
    new Map(Object.entries(object).map(([key, value]) => [key, isPlainObject(value) ? objectToMapDeep(value) : value]))
  );
}
