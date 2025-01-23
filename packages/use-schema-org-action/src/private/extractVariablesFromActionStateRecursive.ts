import { parse } from 'valibot';
import { type ActionState } from '../ActionState';
import propertyValueSpecificationSchema from '../PropertyValueSpecificationSchema';
import { type VariableMap } from '../VariableMap';
import isPlainObject from './isPlainObject';

export default function extractVariablesFromActionStateRecursive<T extends Record<string, any>>(
  action: T,
  actionState: ActionState | undefined,
  mode: 'input' | 'output'
): VariableMap {
  const variables = new Map<string, any>();

  for (const [key, value] of Object.entries(action)) {
    if (mode === 'input' && key.endsWith('-input')) {
      const unprefixedKey = key.slice(0, -6);

      const { valueName } = parse(propertyValueSpecificationSchema, value);

      if (typeof valueName !== 'undefined') {
        variables.set(valueName, actionState?.[unprefixedKey]);
      }
    } else if (mode === 'output' && key.endsWith('-output')) {
      const unprefixedKey = key.slice(0, -7);

      const { valueName } = parse(propertyValueSpecificationSchema, value);

      if (typeof valueName !== 'undefined') {
        variables.set(valueName, actionState?.[unprefixedKey]);
      }
    } else if (isPlainObject(value)) {
      for (const entry of extractVariablesFromActionStateRecursive(action[key], actionState?.[key], mode)) {
        variables.set(entry[0], entry[1]);
      }
    }
  }

  return variables;
}
