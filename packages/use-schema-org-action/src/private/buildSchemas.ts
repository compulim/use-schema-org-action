import { type JsonObject } from 'type-fest';
import {
  bigint,
  boolean,
  date,
  number,
  object,
  optional,
  parse,
  string,
  union,
  type BaseSchema,
  type ObjectSchema
} from 'valibot';

import PropertyValueSpecificationSchema from '../PropertyValueSpecificationSchema';
import isPlainObject from './isPlainObject';

type ObjectSchemaOf<T> = ObjectSchema<Record<string, BaseSchema>, undefined, T> & JsonObject;

const propertyValue = () => union([bigint(), boolean(), date(), number(), string()]);

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

      inputSchema.set(rawKey, spec.valueRequired ? propertyValue() : optional(propertyValue()));
    } else if (key.endsWith('-output')) {
      const spec = parse(PropertyValueSpecificationSchema, value);
      const rawKey = key.substring(0, key.length - 7);

      outputSchema.set(rawKey, spec.valueRequired ? propertyValue() : optional(propertyValue()));
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

export default function buildSchemas<TInput extends object, TOutput extends object>(
  action: object
): readonly [ObjectSchemaOf<TInput>, ObjectSchemaOf<TOutput>] {
  const [inputSchema, outputSchema] = buildSchemasCore(action);

  return Object.freeze([
    (inputSchema || object({})) as ObjectSchemaOf<TInput>,
    (outputSchema || object({})) as ObjectSchemaOf<TOutput>
  ]);
}
