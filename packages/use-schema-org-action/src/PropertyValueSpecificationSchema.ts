import {
  boolean,
  object,
  optional,
  parse,
  string,
  transform,
  union,
  value,
  type Output,
  type StringSchema
} from 'valibot';

const PropertyValueSpecificationObjectSchema = object({
  '@type': optional(
    string([value('PropertyValueSpecificationSchema')]) as StringSchema<'PropertyValueSpecificationSchema'>
  ),
  valueName: optional(string()),
  valueRequired: optional(boolean())
});

const PropertyValueSpecificationStringSchema = transform<
  StringSchema,
  Output<typeof PropertyValueSpecificationObjectSchema>
>(string(), value => {
  const spec: Partial<Output<typeof PropertyValueSpecificationObjectSchema>> = {};

  const specMap = new Map(
    value.split(/\s+/g).map((token): [string, string] => {
      // Split must have at least 1 token.
      const name = token.split('=', 1)[0] as string;

      return [name, token.slice(name.length + 1)];
    })
  );

  if (specMap.has('name')) {
    spec.valueName = specMap.get('name');
  }

  if (specMap.has('required')) {
    spec.valueRequired = true;
  }

  return parse(PropertyValueSpecificationObjectSchema, spec);
});

const PropertyValueSpecificationSchema = () =>
  union([PropertyValueSpecificationObjectSchema, PropertyValueSpecificationStringSchema]);

export default PropertyValueSpecificationSchema;

export type PropertyValueSpecification = Output<typeof PropertyValueSpecificationObjectSchema> | string;
