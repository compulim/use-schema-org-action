import { bigint, boolean, date, number, string, union, type InferOutput } from 'valibot';

const propertyValue = () => union([bigint(), boolean(), date(), number(), string()]);

export default propertyValue;

export type PropertyValue = InferOutput<ReturnType<typeof propertyValue>>;
