import { type VariableMap } from './VariableMap.ts';

/**
 * Converts `Map` of variables into `URLSearchParams`.
 *
 * - `boolean` and `number` will be converted to string
 * - `Date` will be converted by its `toISOString()` function
 * - `null` and `undefined` will be converted to empty string
 * - Other types will be converted by their `toString()` function
 *
 * @param variableMap Variables to convert.
 * @returns {URLSearchParams}
 */
export default function toURLSearchParams(variableMap: VariableMap): URLSearchParams {
  return new URLSearchParams(
    Array.from(
      variableMap
        .entries()
        .map(([key, value]): [string, string] => [
          key,
          typeof value === 'undefined' || value === null
            ? ''
            : typeof value === 'object' && 'toLocaleString' in value
              ? `${value.toISOString()}`
              : `${value}`
        ])
    )
  );
}
