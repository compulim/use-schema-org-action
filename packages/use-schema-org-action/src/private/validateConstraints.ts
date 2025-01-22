import { safeParse } from 'valibot';
import buildSchemaFromConstraintsRecursive from './buildSchemaFromConstraintsRecursive';

export default function validateConstraints<T extends object>(
  action: T,
  mode: 'input' | 'output'
): Readonly<ValidityState> {
  const schema = buildSchemaFromConstraintsRecursive(action, mode);

  // TODO: Should implement ValidityState with multiple issues.
  //       https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
  const { success } = safeParse(schema, action);

  return Object.freeze({
    badInput: false,
    customError: !success,
    patternMismatch: false,
    rangeOverflow: false,
    rangeUnderflow: false,
    stepMismatch: false,
    tooLong: false,
    tooShort: false,
    typeMismatch: false,
    valid: success,
    valueMissing: false
  } satisfies ValidityState);
}
