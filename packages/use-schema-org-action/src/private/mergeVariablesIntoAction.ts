import { generatorWithLastValue } from 'iter-fest';
import { parse, safeParse } from 'valibot';
import propertyValueSpecificationSchema, { toValibotSchema } from '../PropertyValueSpecificationSchema';
import isPlainObject from './isPlainObject';

function* mergeVariablesIntoActionInternal(
  actionEntries: readonly (readonly [string, unknown])[],
  variables: ReadonlyMap<string, boolean | Date | number | string | undefined>,
  mode: 'input' | 'output'
): Generator<readonly [string, unknown], boolean, void> {
  let isValid = true;
  const mergedVariableKeys = new Set<string>();

  for (const [key, value] of actionEntries) {
    if (mergedVariableKeys.has(key)) {
      // If the key/value has already emitted via output, don't emit again, otherwise, it would overwrite the value.
      continue;
    }

    let variableKey =
      mode === 'input' && key.endsWith('-input')
        ? key.slice(0, -6)
        : mode === 'output' && key.endsWith('-output')
          ? key.slice(0, -7)
          : undefined;

    if (typeof variableKey === 'string') {
      yield [key, value];

      const propertyValueSpecification = parse(propertyValueSpecificationSchema, value);

      const { valueName } = propertyValueSpecification;

      const variableValue =
        (typeof valueName === 'string' && variables.get(valueName)) ||
        actionEntries.find(entry => entry[0] === variableKey)?.[1];

      if (typeof variableValue !== 'undefined') {
        yield [variableKey, variableValue];

        mergedVariableKeys.add(variableKey);
      }

      const { success } = safeParse(toValibotSchema(propertyValueSpecification), variableValue);

      isValid &&= success;
    } else if (isPlainObject(value)) {
      const nextActionEntries = mergeVariablesIntoActionInternal(Object.entries(value), variables, mode);
      const generator = generatorWithLastValue(nextActionEntries);

      yield [key, Object.fromEntries(generator)];

      isValid &&= generator.lastValue();
    } else {
      yield [key, value];
    }
  }

  return isValid;
}

export default function mergeVariablesIntoAction<TAction extends {}>(
  action: TAction,
  variables: ReadonlyMap<string, boolean | Date | number | string | undefined>,
  mode: 'input' | 'output'
): { isValid: boolean; value: TAction } {
  const nextActionEntries = mergeVariablesIntoActionInternal(Object.entries(action), variables, mode);
  const generator = generatorWithLastValue(nextActionEntries);

  // for (const [k, v] of generator) {
  //   console.log(`${k}: ${JSON.stringify(v, null, 2)}`);
  // }

  const value = Object.fromEntries(generator) as TAction;

  return Object.freeze({
    isValid: generator.lastValue(),
    value
  });
}
