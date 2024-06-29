import { boolean, object, optional, parse, pipe, string, transform, union, value, type InferOutput } from 'valibot';

const PropertyValueSpecificationObjectSchema = object({
  '@type': optional(
    pipe(string(), value('PropertyValueSpecificationSchema', 'Must be "PropertyValueSpecificationSchema"'))
  ),
  valueName: optional(string()),
  valueRequired: optional(boolean())
});

const PropertyValueSpecificationStringSchema = pipe(
  string(),
  transform<string, InferOutput<typeof PropertyValueSpecificationObjectSchema>>(value => {
    const spec: Partial<InferOutput<typeof PropertyValueSpecificationObjectSchema>> = {};

    const specMap = new Map(
      parse(string(), value)
        .split(/\s+/g)
        .map((token): [string, string] => {
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
  })
);

const PropertyValueSpecificationSchema = () =>
  union([PropertyValueSpecificationObjectSchema, PropertyValueSpecificationStringSchema]);

export default PropertyValueSpecificationSchema;

export type PropertyValueSpecification = InferOutput<typeof PropertyValueSpecificationObjectSchema> | string;
