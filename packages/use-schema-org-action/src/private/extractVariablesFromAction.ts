import { boolean, date, number, parse, string, undefined_, union, type InferOutput } from 'valibot';
import propertyValueSpecificationSchema from '../PropertyValueSpecificationSchema.ts';
import isPlainObject from './isPlainObject.ts';

const supportedValueType = union([boolean(), date(), number(), string(), undefined_()]);

type SupportedValueType = InferOutput<typeof supportedValueType>;

function* extractVariablesFromActionInternal(
  actionEntries: readonly (readonly [string, unknown])[],
  mode: 'input' | 'output'
): Iterable<[string, SupportedValueType]> {
  for (const [key, value] of actionEntries) {
    const variableKey =
      mode === 'input' && key.endsWith('-input')
        ? key.slice(0, -6)
        : mode === 'output' && key.endsWith('-output')
          ? key.slice(0, -7)
          : undefined;

    if (typeof variableKey === 'string') {
      const propertyValueSpecification = parse(propertyValueSpecificationSchema, value);
      const { valueName } = propertyValueSpecification;

      if (valueName) {
        const variableEntry = actionEntries.find(([key]) => key === variableKey);

        if (variableEntry) {
          yield [valueName, parse(supportedValueType, variableEntry[1])];
        }
      }
    } else if (isPlainObject(value)) {
      yield* extractVariablesFromActionInternal(Object.entries(value), mode);
    }
  }
}

export default function extractVariablesFromAction<TAction extends object>(
  action: TAction,
  mode: 'input' | 'output'
): ReadonlyMap<string, SupportedValueType> {
  return Object.freeze(new Map(extractVariablesFromActionInternal(Object.entries(action), mode)));
}
