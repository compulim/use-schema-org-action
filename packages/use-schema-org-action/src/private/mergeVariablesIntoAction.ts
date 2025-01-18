import { generatorWithLastValue } from 'iter-fest';
import { parse, safeParse } from 'valibot';
import PropertyValueSpecificationSchema, { toValibotSchema } from '../PropertyValueSpecificationSchema';
import isPlainObject from './isPlainObject';

function* mergeVariablesIntoActionInternal(
  actionEntries: readonly (readonly [string, unknown])[],
  variables: ReadonlyMap<string, boolean | Date | number | string | undefined>,
  mode: 'input' | 'output'
): Generator<readonly [string, unknown], boolean, void> {
  let isValid = true;

  for (const [key, value] of actionEntries) {
    let variableKey =
      mode === 'input' && key.endsWith('-input')
        ? key.slice(0, -6)
        : mode === 'output' && key.endsWith('-output')
          ? key.slice(0, -7)
          : undefined;

    if (typeof variableKey === 'string') {
      yield [key, value];

      const propertyValueSpecification = parse(PropertyValueSpecificationSchema(), value);

      const { valueName } = propertyValueSpecification;

      const variableValue = typeof valueName === 'string' ? variables.get(valueName) : undefined;

      if (typeof variableValue !== 'undefined') {
        yield [variableKey, variableValue];
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

  const value = Object.fromEntries(generator) as TAction;

  return Object.freeze({
    isValid: generator.lastValue(),
    value
  });
}
