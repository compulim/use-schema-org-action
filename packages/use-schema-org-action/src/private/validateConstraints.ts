import { safeParse, type ErrorMessage, type ObjectEntries, type ObjectIssue, type ObjectSchema } from 'valibot';

export default function validateConstraints(
  schema: ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>,
  actionState: unknown
): Readonly<ValidityState> {
  // TODO: Should implement ValidityState with multiple issues.
  //       https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
  const { success } = safeParse(schema, actionState);

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
