import { boolean, object, optional, string, type Output } from 'valibot';
import { type JsonObject } from 'type-fest';

const PropertyValueSpecificationSchema = object({
  valueName: optional(string()),
  valueRequired: optional(boolean())
});

export default PropertyValueSpecificationSchema;

export type PropertyValueSpecification = Output<typeof PropertyValueSpecificationSchema> & JsonObject;
