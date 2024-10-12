import { type InferOutput } from 'valibot';
import { SchemaOrgSchema } from './private/buildSchemas.ts';

export type SchemaOrgObject = InferOutput<SchemaOrgSchema>;
