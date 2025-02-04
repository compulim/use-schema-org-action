import toURLSearchParams from './toURLSearchParams';
import { type VariableMap } from './VariableMap';

/**
 * Converts `Map` of variables into object of strings.
 *
 * - `boolean` and `number` will be converted to string
 * - `Date` will be converted by its `toISOString()` function
 * - `null` and `undefined` will be converted to empty string
 * - Other types will be converted by their `toString()` function
 *
 * The return value can be passed to [`url-template`](https://npmjs.com/package/url-template) package.
 *
 * @param variableMap `Map` of variables to convert into object of strings.
 * @returns {Record<string, string[]>}
 */
export default function toURLTemplateData(variableMap: VariableMap): Record<string, string[]> {
  let expandables: Record<string, string[]> = {};

  toURLSearchParams(variableMap).forEach((value, key) => (expandables[key] = expandables[key] || []).push(value));

  return expandables;
}
