import { useCallback, useEffect, useMemo, useRef, type Dispatch, type SetStateAction } from 'react';
import { type JsonObject } from 'type-fest';
import { useStateWithRef } from 'use-state-with-ref';
import { parse, safeParse, type Output } from 'valibot';

import buildSchemas from './private/buildSchemas';
import getNamedValues from './private/getNamedValues';
import mergeDeep from './private/mergeDeep';
import omitInputOutputDeep from './private/omitInputOutputDeep';

type Action = JsonObject;

export default function useSchemaOrgAction<T extends Action>(
  initialAction: T
): [
  T,
  Dispatch<SetStateAction<T>>,
  (fn: (action: T, values: Map<string, unknown>) => Promise<Partial<T>>) => Promise<void>,
  boolean
] {
  const abortController = useMemo(() => new AbortController(), []);
  const initialActionRef = useRef(initialAction);
  const [inputSchema, outputSchema] = useMemo(() => buildSchemas(initialActionRef.current), [initialActionRef]);

  const [action, setAction, actionRef] = useStateWithRef<T>(omitInputOutputDeep(initialActionRef.current) as T);
  const isInputValid = useMemo(() => safeParse(inputSchema, action).success, [action, inputSchema]);

  useEffect(() => () => abortController.abort(), [abortController]);

  const perform = useCallback(
    async (fn: (action: T, values: Map<string, unknown>) => Promise<Partial<T>>) => {
      const nextAction = { ...actionRef.current, actionStatus: 'ActiveActionStatus' };

      setAction(action => ({ ...action, actionStatus: 'ActiveActionStatus' }));

      let output: Output<typeof outputSchema> | undefined = undefined;

      try {
        const input = parse(inputSchema, nextAction);

        const values = getNamedValues(initialActionRef.current, input);

        const result = await fn(nextAction, values);

        output = parse(outputSchema, result);
      } catch (error) {
        abortController.signal.aborted || setAction(action => ({ ...action, actionStatus: 'FailedActionStatus' }));

        throw error;
      }

      abortController.signal.aborted ||
        setAction(action => mergeDeep({ ...action, actionStatus: 'CompletedActionStatus' }, output) as T);
    },
    [actionRef, initialActionRef, inputSchema, outputSchema, setAction]
  );

  return [action, setAction, perform, isInputValid];
}
