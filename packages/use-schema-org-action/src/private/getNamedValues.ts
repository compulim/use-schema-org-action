import { parse } from 'valibot';

import PropertyValueSpecificationSchema from '../PropertyValueSpecificationSchema';
import isPlainObject from './isPlainObject';

export default function getNamedValues<T extends Record<string, unknown>>(
  object1: T,
  object2: T
): Map<string, unknown> {
  const map = new Map<string, unknown>();

  for (const [key, value] of Object.entries(object1)) {
    if (key.endsWith('-input')) {
      const { valueName } = parse(PropertyValueSpecificationSchema, value);

      if (valueName) {
        map.set(valueName, object2?.[key.substring(0, key.length - 6)]);
      }
    } else if (isPlainObject(value) && object2[key]) {
      const subMap = getNamedValues(value, object2[key] as T);

      for (const entries of subMap.entries()) {
        map.set(...entries);
      }
    }
  }

  return map;
}
