import { object, type ErrorMessage, type ObjectEntries, type ObjectIssue, type ObjectSchema } from 'valibot';
import { toValibotSchema } from '../PropertyValueSpecificationSchema';
import isPlainObject from './isPlainObject';

export default function buildSchemaFromConstraintsRecursive<T extends object>(
  action: T,
  mode: 'input' | 'output'
): ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | undefined {
  let empty = true;
  const objectEntriesSchema: ObjectEntries = {};

  for (const [key, value] of Object.entries(action)) {
    if (mode === 'input' && key.endsWith('-input')) {
      empty = false;
      objectEntriesSchema[key.slice(0, -6)] = toValibotSchema(value);
    } else if (mode === 'output' && key.endsWith('-output')) {
      empty = false;
      objectEntriesSchema[key.slice(0, -7)] = toValibotSchema(value);
    } else if (isPlainObject(value)) {
      const schema = buildSchemaFromConstraintsRecursive(value, mode);

      if (schema) {
        empty = false;
        objectEntriesSchema[key] = schema;
      }
    }
  }

  return empty ? undefined : object(objectEntriesSchema);
}
