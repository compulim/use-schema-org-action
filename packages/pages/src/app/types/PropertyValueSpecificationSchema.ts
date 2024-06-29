import { boolean, object, optional, string, type InferOutput } from 'valibot';

const PropertyValueSpecificationSchema = object({
  valueName: optional(string()),
  valueRequired: optional(boolean(), false)
});

export default PropertyValueSpecificationSchema;

export type PropertyValueSpecification = InferOutput<typeof PropertyValueSpecificationSchema>;
