import { object, type ErrorMessage, type ObjectEntries, type ObjectIssue, type ObjectSchema } from 'valibot';
import { toValibotSchema } from '../PropertyValueSpecificationSchema.ts';
import isPlainObject from './isPlainObject.ts';

function buildSchemaFromConstraintsRecursiveInternal<T extends object>(
  action: T,
  mode: 'input' | 'output'
): ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> | undefined {
  const objectEntriesSchema: ObjectEntries = {};

  for (const [key, value] of Object.entries(action)) {
    if (mode === 'input' && key.endsWith('-input')) {
      const unprefixedKey = key.slice(0, -6);
      const unprefixedValue = isPlainObject(action) && action[unprefixedKey];

      objectEntriesSchema[unprefixedKey] = toValibotSchema(
        value,
        Array.isArray(unprefixedValue) ? unprefixedValue : undefined
      );
    } else if (mode === 'output' && key.endsWith('-output')) {
      const unprefixedKey = key.slice(0, -7);
      const unprefixedValue = isPlainObject(action) && action[unprefixedKey];

      objectEntriesSchema[unprefixedKey] = toValibotSchema(
        value,
        Array.isArray(unprefixedValue) ? unprefixedValue : undefined
      );
    } else if (isPlainObject(value)) {
      const schema = buildSchemaFromConstraintsRecursiveInternal(value, mode);

      if (schema) {
        objectEntriesSchema[key] = schema;
      }
    }
  }

  return Object.entries(objectEntriesSchema).length ? object(objectEntriesSchema) : undefined;
}

export default function buildSchemaFromConstraintsRecursive<T extends object>(
  action: T,
  mode: 'input' | 'output'
): ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> {
  return buildSchemaFromConstraintsRecursiveInternal(action, mode) || object({});
}
