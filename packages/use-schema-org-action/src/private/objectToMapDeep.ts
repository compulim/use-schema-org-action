import isPlainObject from './isPlainObject';

export default function objectToMapDeep(object: Record<string, unknown>): Map<string, unknown> {
  return new Map(
    Object.entries(object).map(([key, value]) => [key, isPlainObject(value) ? objectToMapDeep(value) : value])
  );
}
