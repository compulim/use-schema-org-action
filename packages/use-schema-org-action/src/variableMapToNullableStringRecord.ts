import { type VariableMap } from './VariableMap';

export default function variableMapToNullableStringRecord(variables: VariableMap): Record<string, null | string> {
  const stringEntries = variables
    .entries()
    .map(([key, value]) => [
      key,
      typeof value === 'undefined' ? null : value instanceof Date ? value.toISOString() : value.toString()
    ]);

  return Object.fromEntries(stringEntries);
}
