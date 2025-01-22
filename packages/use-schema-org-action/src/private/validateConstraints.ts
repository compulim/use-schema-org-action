import { safeParse } from 'valibot';
import buildSchemaFromConstraintsRecursive from './buildSchemaFromConstraintsRecursive';

export default function validateConstraints<T extends object>(
  action: T,
  mode: 'input' | 'output'
): Readonly<{ valid: boolean }> {
  const schema = buildSchemaFromConstraintsRecursive(action, mode);

  // TODO: Should implement ValidityState with multiple issues.
  //       https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
  return Object.freeze({ valid: safeParse(schema, action).success });
}
