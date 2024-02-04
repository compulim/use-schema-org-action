import { type JsonObject } from 'type-fest';
import { boolean, object, optional, string, value, type Output, type StringSchema } from 'valibot';

const PropertyValueSpecificationSchema = object({
  '@type': optional(
    string([value('PropertyValueSpecificationSchema')]) as StringSchema<'PropertyValueSpecificationSchema'>
  ),
  valueName: optional(string()),
  valueRequired: optional(boolean())
});

export default PropertyValueSpecificationSchema;

export type PropertyValueSpecification = Output<typeof PropertyValueSpecificationSchema> & JsonObject;
