import { picklist, type InferOutput } from 'valibot';

/** Validation schema for `ActionStatusType`. */
const actionStatusTypeSchema = picklist([
  'ActiveActionStatus',
  'CompletedActionStatus',
  'FailedActionStatus',
  'PotentialActionStatus'
]);

/** Indicates the current disposition of the [Action](https://schema.org/Action). */
type ActionStatusType = InferOutput<typeof actionStatusTypeSchema>;

export { actionStatusTypeSchema, type ActionStatusType };
