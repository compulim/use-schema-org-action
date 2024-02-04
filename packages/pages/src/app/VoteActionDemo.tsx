import { memo, useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { type JsonObject } from 'type-fest';
import { useStateWithRef } from 'use-state-with-ref';

import { any, object, parse, type BaseSchema } from 'valibot';
import PropertyValueSpecificationSchema from './types/PropertyValueSpecificationSchema';

type Action = JsonObject;

function isPlainObject(object: unknown): object is Record<string, unknown> {
  return Object.prototype.toString.call(object) === '[object Object]';
}

function buildSchemas(action: object): [BaseSchema, BaseSchema] {
  const inputSchema: Record<string, BaseSchema> = {};
  const outputSchema: Record<string, BaseSchema> = {};

  for (const [key, value] of Object.entries(action)) {
    if (key.endsWith('-input')) {
      const spec = parse(PropertyValueSpecificationSchema, value);

      if (spec.valueRequired) {
        inputSchema[key.substring(0, key.length - 6)] = any();
      }
    } else if (key.endsWith('-output')) {
      const spec = parse(PropertyValueSpecificationSchema, value);

      if (spec.valueRequired) {
        outputSchema[key.substring(0, key.length - 7)] = any();
      }
    } else if (isPlainObject(value)) {
      const [subInputSchema, subOutputSchema] = buildSchemas(value);

      inputSchema[key] = subInputSchema;
      outputSchema[key] = subOutputSchema;
    }
  }

  return [object(inputSchema), object(outputSchema)];
}

function omitInputOutputDeep<T extends Record<string, unknown>>(object: T): T & Record<`${string}-input`, never> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};

  for (const [key, value] of Object.entries(object)) {
    if (!key.endsWith('-input') && !key.endsWith('-output')) {
      result[key] = isPlainObject(value) ? omitInputOutputDeep(value) : value;
    }
  }

  return result;
}

function getNamedValues<T extends Record<string, unknown>>(object1: T, object2: T): Map<string, unknown> {
  const map = new Map<string, unknown>();

  for (const [key, value] of Object.entries(object1)) {
    if (key.endsWith('-input')) {
      const { valueName } = parse(PropertyValueSpecificationSchema, value);

      if (valueName) {
        map.set(valueName, object2[key.substring(0, key.length - 6)]);
      }
    } else if (isPlainObject(value)) {
      const subMap = getNamedValues(value, object2[key] as T);

      for (const entries of subMap.entries()) {
        map.set(...entries);
      }
    }
  }

  return map;
}

function merge(source: Record<string, unknown>, merging: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...source };

  for (const [key, value] of Object.entries(merging)) {
    if (isPlainObject(value)) {
      const sourceValue = source[key];

      if (isPlainObject(sourceValue)) {
        next[key] = merge(sourceValue, value);
      } else {
        next[key] = merge({}, value);
      }
    } else {
      next[key] = value;
    }
  }

  return next;
}

function useSchemaOrgAction<T extends Action>(
  initialAction: T
): [
  T,
  Dispatch<SetStateAction<T>>,
  (fn: (action: T, values: Map<string, unknown>) => Promise<Partial<T>>) => Promise<void>
] {
  const initialActionRef = useRef(initialAction);
  const [inputSchema, outputSchema] = useMemo(() => buildSchemas(initialActionRef.current), [initialActionRef]);

  const [action, setAction] = useState<T>(omitInputOutputDeep(initialActionRef.current) as T);

  const perform = async (fn: (action: T, values: Map<string, unknown>) => Promise<Partial<T>>) => {
    const input = parse(inputSchema, action);

    const values = getNamedValues(initialActionRef.current, input);

    const output = parse(outputSchema, await fn(action, values));

    setAction(action => merge(action, output) as T);
  };

  return [action, setAction, perform];
}

const VoteActionDemo = memo(() => {
  const abortController = useMemo(() => new AbortController(), []);

  useEffect(() => () => abortController.abort(), [abortController]);

  const [upvoteAction, setUpvoteAction, upvoteActionRef] = useStateWithRef({
    '@context': 'https://schema.org',
    '@type': 'VoteAction',
    actionOption: 'upvote',
    actionStatus: 'ActiveActionStatus',
    'actionStatus-output': 'required',
    target: 'https://.../'
  });

  const handleUpvoteClick = useCallback(() => {
    (async function () {
      const { current: upvoteAction } = upvoteActionRef;

      setUpvoteAction(upvoteAction => ({
        ...upvoteAction,
        actionStatus: 'CompletedActionStatus'
      }));
    })();
  }, [setUpvoteAction, upvoteActionRef]);

  return (
    <div>
      <button onClick={handleUpvoteClick} type="button">
        👍🏻
      </button>
      <button type="button">👎🏻</button>
    </div>
  );
});

VoteActionDemo.displayName = 'VoteActionDemo';

export default VoteActionDemo;
