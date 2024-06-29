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
  type ObjectSchema,
  type OptionalSchema,
  type StringSchema
} from 'valibot';

import PropertyValueSpecificationSchema from '../PropertyValueSpecificationSchema';
import isPlainObject from './isPlainObject';

export type SchemaOrgSchema = ObjectSchema<
  {
    '@context': OptionalSchema<StringSchema<undefined>, never>;
    '@type': OptionalSchema<StringSchema<undefined>, never>;
  },
  undefined
>;

const propertyValue = () => union([bigint(), boolean(), date(), number(), string()]);

function mapToObject<T>(map: Map<string, T>): { [k: string]: T } {
  return Object.fromEntries(map.entries());
}

function buildSchemasCore(action: object): [SchemaOrgSchema | undefined, SchemaOrgSchema | undefined] {
  const inputSchema: Map<
    string,
    ReturnType<typeof propertyValue> | OptionalSchema<ReturnType<typeof propertyValue>, undefined> | SchemaOrgSchema
  > = new Map();
  const outputSchema: Map<
    string,
    ReturnType<typeof propertyValue> | OptionalSchema<ReturnType<typeof propertyValue>, undefined> | SchemaOrgSchema
  > = new Map();

  for (const [key, value] of Object.entries(action)) {
    if (key.endsWith('-input')) {
      const spec = parse(PropertyValueSpecificationSchema(), value);
      const rawKey = key.substring(0, key.length - 6);

      inputSchema.set(rawKey, spec.valueRequired ? propertyValue() : optional(propertyValue()));
    } else if (key.endsWith('-output')) {
      const spec = parse(PropertyValueSpecificationSchema(), value);
      const rawKey = key.substring(0, key.length - 7);

      outputSchema.set(rawKey, spec.valueRequired ? propertyValue() : optional(propertyValue()));
    } else if (isPlainObject(value)) {
      const [subInputSchema, subOutputSchema] = buildSchemasCore(value);

      subInputSchema && inputSchema.set(key, subInputSchema);
      subOutputSchema && outputSchema.set(key, subOutputSchema);
    }
  }

  return [
    inputSchema.size
      ? object({ '@context': optional(string()), '@type': optional(string()), ...mapToObject(inputSchema) })
      : undefined,
    outputSchema.size
      ? object({ '@context': optional(string()), '@type': optional(string()), ...mapToObject(outputSchema) })
      : undefined
  ];
}

export default function buildSchemas<
  TInputSchema extends SchemaOrgSchema = SchemaOrgSchema,
  TOutputSchema extends SchemaOrgSchema = SchemaOrgSchema
>(action: object): readonly [TInputSchema, TOutputSchema] {
  const [inputSchema, outputSchema] = buildSchemasCore(action);

  return Object.freeze([(inputSchema || object({})) as TInputSchema, (outputSchema || object({})) as TOutputSchema]);
}
