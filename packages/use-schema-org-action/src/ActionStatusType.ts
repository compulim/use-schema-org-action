import { picklist, type InferOutput } from 'valibot';

const actionStatusTypeSchema = picklist([
  'ActiveActionStatus',
  'CompletedActionStatus',
  'FailedActionStatus',
  'PotentialActionStatus'
]);

type ActionStatusType = InferOutput<typeof actionStatusTypeSchema>;

export { actionStatusTypeSchema, type ActionStatusType };
