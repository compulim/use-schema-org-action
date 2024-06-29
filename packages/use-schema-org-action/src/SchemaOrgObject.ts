import type { InferOutput } from 'valibot';
import { SchemaOrgSchema } from './private/buildSchemas';

export type SchemaOrgObject = InferOutput<SchemaOrgSchema>;
