import { object, optional, parse, string, type ObjectSchema, type OptionalSchema, type StringSchema } from 'valibot';

import PropertyValueSpecificationSchema, { toValibotSchema } from '../PropertyValueSpecificationSchema.ts';
import isPlainObject from './isPlainObject.ts';

type SchemaOrgSchema = ObjectSchema<
  {
    '@context': OptionalSchema<StringSchema<undefined>, never>;
    '@type': OptionalSchema<StringSchema<undefined>, never>;
  },
  undefined
>;

function mapToObject<T>(map: Map<string, T>): { [k: string]: T } {
  return Object.fromEntries(map.entries());
}

function buildSchemasCore(action: object): [SchemaOrgSchema | undefined, SchemaOrgSchema | undefined] {
  const inputSchema: Map<string, ReturnType<typeof toValibotSchema>> = new Map();
  const outputSchema: Map<string, ReturnType<typeof toValibotSchema>> = new Map();

  for (const [key, value] of Object.entries(action)) {
    if (key.endsWith('-input')) {
      const spec = parse(PropertyValueSpecificationSchema(), value);
      const rawKey = key.substring(0, key.length - 6);

      inputSchema.set(rawKey, toValibotSchema(spec));
    } else if (key.endsWith('-output')) {
      const spec = parse(PropertyValueSpecificationSchema(), value);
      const rawKey = key.substring(0, key.length - 7);

      outputSchema.set(rawKey, toValibotSchema(spec));
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

export type { SchemaOrgSchema };
