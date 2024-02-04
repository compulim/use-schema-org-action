import { boolean, object, optional, string, type Output } from 'valibot';

const PropertyValueSpecificationSchema = object({
  valueName: optional(string()),
  valueRequired: optional(boolean(), false)
});

export default PropertyValueSpecificationSchema;

export type PropertyValueSpecification = Output<typeof PropertyValueSpecificationSchema>;
