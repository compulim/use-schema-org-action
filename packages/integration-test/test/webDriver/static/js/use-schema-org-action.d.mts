import * as valibot from 'valibot';
import { InferOutput, SchemaWithPipe, ObjectSchema, ObjectEntries, ErrorMessage, ObjectIssue } from 'valibot';
import { Dispatch, SetStateAction } from 'react';

/**
 * Input and output properties of an [Action](https://schema.org/Action) and [`actionStatus` property](https://schema.org/actionStatus).
 */
type ActionState = Record<string, any>;

/** A `Map` of variables for URL template expansion. */
type VariableMap = ReadonlyMap<string, any>;

/**
 * When called, should perform the action and return action state containing all properties with output constraints.
 *
 * @param request Input properties validated against input constraints.
 * @param inputVariables `Map` of input variables for URL template expansion.
 * @returns Output properties, will merge into action state after validated against output constraints.
 */
type ActionHandler = (
/**
 * Input properties validated against input constraints.
 *
 * Only properties with input constraints (marked by `*-input`) will be included in the `request` object.
 */
request: ActionState, 
/**
 * `Map` of input variables for URL template expansion.
 *
 * Only properties with name specified in input constraints will be included in the `inputVariables` map.
 */
inputVariables: VariableMap, init: Readonly<{
    /** `AbortSignal` for detecting early unmount. */
    signal: AbortSignal;
}>) => Promise<ActionState>;

/** Validation schema for `ActionStatusType`. */
declare const actionStatusTypeSchema: valibot.PicklistSchema<["ActiveActionStatus", "CompletedActionStatus", "FailedActionStatus", "PotentialActionStatus"], undefined>;
/** Indicates the current disposition of the [Action](https://schema.org/Action). */
type ActionStatusType = InferOutput<typeof actionStatusTypeSchema>;

/** [Action](https://schema.org/Action) with [`actionStatus`](https://schema.org/actionStatus) property. */
type ActionWithActionStatus<T> = T & {
    /** Indicates the current disposition of the Action. */
    actionStatus: ActionStatusType;
};

declare const propertyValueSpecificationObjectSchema: valibot.ObjectSchema<{
    readonly '@type': valibot.OptionalSchema<SchemaWithPipe<readonly [valibot.StringSchema<undefined>, valibot.LiteralSchema<"PropertyValueSpecification", "Must be \"PropertyValueSpecification\"">]>, undefined>;
    readonly defaultValue: valibot.OptionalSchema<valibot.UnionSchema<[valibot.DateSchema<undefined>, valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly maxValue: valibot.OptionalSchema<valibot.UnionSchema<[valibot.DateSchema<undefined>, valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly minValue: valibot.OptionalSchema<valibot.UnionSchema<[valibot.DateSchema<undefined>, valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly multipleValues: valibot.OptionalSchema<valibot.BooleanSchema<undefined>, undefined>;
    readonly stepValue: valibot.OptionalSchema<valibot.UnionSchema<[valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly valueMaxLength: valibot.OptionalSchema<valibot.UnionSchema<[valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly valueMinLength: valibot.OptionalSchema<valibot.UnionSchema<[valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly valueName: valibot.OptionalSchema<valibot.StringSchema<undefined>, undefined>;
    readonly valuePattern: valibot.OptionalSchema<valibot.InstanceSchema<RegExpConstructor, undefined>, undefined>;
    readonly valueRequired: valibot.OptionalSchema<valibot.BooleanSchema<undefined>, undefined>;
}, undefined>;
/** Validation schema for `PropertyValueSpecification`. */
declare const propertyValueSpecificationSchema: valibot.UnionSchema<[valibot.ObjectSchema<{
    readonly '@type': valibot.OptionalSchema<SchemaWithPipe<readonly [valibot.StringSchema<undefined>, valibot.LiteralSchema<"PropertyValueSpecification", "Must be \"PropertyValueSpecification\"">]>, undefined>;
    readonly defaultValue: valibot.OptionalSchema<valibot.UnionSchema<[valibot.DateSchema<undefined>, valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly maxValue: valibot.OptionalSchema<valibot.UnionSchema<[valibot.DateSchema<undefined>, valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly minValue: valibot.OptionalSchema<valibot.UnionSchema<[valibot.DateSchema<undefined>, valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly multipleValues: valibot.OptionalSchema<valibot.BooleanSchema<undefined>, undefined>;
    readonly stepValue: valibot.OptionalSchema<valibot.UnionSchema<[valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly valueMaxLength: valibot.OptionalSchema<valibot.UnionSchema<[valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly valueMinLength: valibot.OptionalSchema<valibot.UnionSchema<[valibot.NumberSchema<undefined>, valibot.StringSchema<undefined>], undefined>, undefined>;
    readonly valueName: valibot.OptionalSchema<valibot.StringSchema<undefined>, undefined>;
    readonly valuePattern: valibot.OptionalSchema<valibot.InstanceSchema<RegExpConstructor, undefined>, undefined>;
    readonly valueRequired: valibot.OptionalSchema<valibot.BooleanSchema<undefined>, undefined>;
}, undefined>, SchemaWithPipe<readonly [valibot.StringSchema<undefined>, valibot.TransformAction<string, {
    '@type'?: "PropertyValueSpecification" | undefined;
    defaultValue?: string | number | Date | undefined;
    maxValue?: string | number | Date | undefined;
    minValue?: string | number | Date | undefined;
    multipleValues?: boolean | undefined;
    stepValue?: string | number | undefined;
    valueMaxLength?: string | number | undefined;
    valueMinLength?: string | number | undefined;
    valueName?: string | undefined;
    valuePattern?: RegExp | undefined;
    valueRequired?: boolean | undefined;
}>]>], undefined>;
/** A Property value specification. */
type PropertyValueSpecification = InferOutput<typeof propertyValueSpecificationObjectSchema> | string;

/**
 * Converts `Map` of variables into `URLSearchParams`.
 *
 * - `boolean` and `number` will be converted to string
 * - `Date` will be converted by its `toISOString()` function
 * - `null` and `undefined` will be converted to empty string
 * - Other types will be converted by their `toString()` function
 *
 * @param variableMap Variables to convert.
 * @returns {URLSearchParams}
 */
declare function toURLSearchParams(variableMap: VariableMap): URLSearchParams;

/**
 * Converts `Map` of variables into object of strings.
 *
 * - `boolean` and `number` will be converted to string
 * - `Date` will be converted by its `toISOString()` function
 * - `null` and `undefined` will be converted to empty string
 * - Other types will be converted by their `toString()` function
 *
 * The return value can be passed to [`url-template`](https://npmjs.com/package/url-template) package.
 *
 * @param variableMap `Map` of variables to convert into object of strings.
 * @returns {Record<string, string[]>}
 */
declare function toURLTemplateData(variableMap: VariableMap): Record<string, string[]>;

/**
 * Returns a stateful action state, a function to update it, and a function to perform the action.
 *
 * Action state contains only input/output properties and [`actionStatus` property](https://schema.org/actionStatus).
 *
 * @param initialAction Action which the action state is based on.
 * @param onPerform Function to call when the action is being performed.
 * @returns Returns a stateful action state, a function to update it, and a function to perform the action.
 */
declare function useSchemaOrgAction<T extends object = object>(
/** Initial action which the action state is based on. */
initialAction: T, 
/** Function to call when the action is performed. */
onPerform: ActionHandler): readonly [
    /** A stateful action state. */
    ActionState,
    /** A function to update the action state. */
    Dispatch<SetStateAction<ActionState>>,
    Readonly<{
        /** `Map` of named input properties. */
        inputVariables: VariableMap;
        /** Validity of the input properties. */
        inputValidity: ValidityState;
        /** Validation schema for input properties. */
        inputSchema: ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>;
        /** Validation schema for output properties. */
        outputSchema: ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>;
        /** A function to perform the action. */
        perform: () => Promise<void>;
    }>
];

export { type ActionHandler, type ActionState, type ActionStatusType, type ActionWithActionStatus, type PropertyValueSpecification, type VariableMap, actionStatusTypeSchema, propertyValueSpecificationSchema, toURLSearchParams, toURLTemplateData, useSchemaOrgAction };
