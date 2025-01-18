import { picklist, type InferOutput } from 'valibot';

const actionStatusSchema = picklist([
  'ActiveActionStatus',
  'CompletedActionStatus',
  'FailedActionStatus',
  'PotentialActionStatus'
]);

type ActionStatusType = InferOutput<typeof actionStatusSchema>;

export { actionStatusSchema, type ActionStatusType };
