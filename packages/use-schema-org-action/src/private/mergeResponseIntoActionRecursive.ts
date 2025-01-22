import { type PartialDeep } from 'type-fest';
import isPlainObject from './isPlainObject';

export default function mergeResponseIntoActionRecursive<
  T extends object,
  TResponse extends object = PartialDeep<T>,
  TOutput extends object = T
>(action: T, response: TResponse | undefined): TOutput {
  const outputEntries: (readonly [string, unknown])[] = [];
  const entries = Object.entries(action);
  const mergedKeys: Set<string> = new Set();

  for (const [key, value] of entries) {
    if (mergedKeys.has(key)) {
      continue;
    }

    outputEntries.push([key, value]);

    if (key.endsWith('-output')) {
      const valueKey = key.slice(0, -7);

      outputEntries.push([
        valueKey,
        response && isPlainObject(response) && valueKey in response ? response[valueKey] : undefined
      ]);

      mergedKeys.add(valueKey);
    } else if (!key.endsWith('-input') && isPlainObject(value)) {
      const subResponse =
        response && isPlainObject(response) && key in response && isPlainObject(response[key])
          ? response[key]
          : undefined;

      outputEntries.push([key, mergeResponseIntoActionRecursive(value, subResponse)]);
    }
  }

  return Object.fromEntries(outputEntries) as TOutput;
}
