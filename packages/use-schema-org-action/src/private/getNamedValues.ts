import { type ReadonlyDeep } from 'type-fest';
import { parse } from 'valibot';

import PropertyValueSpecificationSchema from '../PropertyValueSpecificationSchema';
import isPlainObject from './isPlainObject';

export default function getNamedValues(
  object1: ReadonlyDeep<Record<string, unknown>>,
  object2: ReadonlyDeep<Record<string, unknown>>
): ReadonlyMap<string, unknown> {
  const map = new Map<string, unknown>();

  for (const [key, value] of Object.entries(object1)) {
    if (key.endsWith('-input')) {
      const { valueName } = parse(PropertyValueSpecificationSchema, value);

      if (valueName) {
        map.set(valueName, object2?.[key.substring(0, key.length - 6)]);
      }
    } else if (isPlainObject(value)) {
      const subObject2 = object2[key];

      if (isPlainObject(subObject2)) {
        const subMap = getNamedValues(value, subObject2);

        for (const entries of subMap.entries()) {
          map.set(...entries);
        }
      }
    }
  }

  return Object.freeze(map);
}
