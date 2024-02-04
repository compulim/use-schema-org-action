import { any, object, optional, parse, type BaseSchema } from 'valibot';

import PropertyValueSpecificationSchema from '../PropertyValueSpecificationSchema';
import isPlainObject from './isPlainObject';

function mapToObject<T>(map: Map<string, T>): { [k: string]: T } {
  return Object.fromEntries(map.entries());
}

function buildSchemasCore(action: object): [BaseSchema | undefined, BaseSchema | undefined] {
  const inputSchema: Map<string, BaseSchema> = new Map();
  const outputSchema: Map<string, BaseSchema> = new Map();

  for (const [key, value] of Object.entries(action)) {
    if (key.endsWith('-input')) {
      const spec = parse(PropertyValueSpecificationSchema, value);
      const rawKey = key.substring(0, key.length - 6);

      inputSchema.set(rawKey, spec.valueRequired ? any() : optional(any()));
    } else if (key.endsWith('-output')) {
      const spec = parse(PropertyValueSpecificationSchema, value);
      const rawKey = key.substring(0, key.length - 7);

      outputSchema.set(rawKey, spec.valueRequired ? any() : optional(any()));
    } else if (isPlainObject(value)) {
      const [subInputSchema, subOutputSchema] = buildSchemasCore(value);

      subInputSchema && inputSchema.set(key, subInputSchema);
      subOutputSchema && outputSchema.set(key, subOutputSchema);
    }
  }

  return [
    inputSchema.size ? object(mapToObject(inputSchema)) : undefined,
    outputSchema.size ? object(mapToObject(outputSchema)) : undefined
  ];
}

export default function buildSchemas(action: object): [BaseSchema, BaseSchema] {
  const [inputSchema, outputSchema] = buildSchemasCore(action);

  return [inputSchema || object({}), outputSchema || object({})];
}
