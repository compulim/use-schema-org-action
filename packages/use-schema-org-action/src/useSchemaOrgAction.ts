import { useCallback, useEffect, useMemo, useRef, type Dispatch, type SetStateAction } from 'react';
import { type JsonObject } from 'type-fest';
import { useStateWithRef } from 'use-state-with-ref';
import { parse, safeParse, type Output } from 'valibot';

import type { ActionWithActionStatus } from './ActionWithActionStatus';
import buildSchemas from './private/buildSchemas';
import getNamedValues from './private/getNamedValues';
import mergeDeep from './private/mergeDeep';
import omitInputOutputDeep from './private/omitInputOutputDeep';

type Action = JsonObject;

export default function useSchemaOrgAction<
  T extends Action,
  TRequest extends Partial<T> = Partial<T>,
  TResponse extends Partial<T> = Partial<T>
>(
  initialAction: T,
  handler: (request: TRequest, values: Map<string, unknown>) => Promise<TResponse>
): readonly [
  ActionWithActionStatus<T>,
  Dispatch<SetStateAction<ActionWithActionStatus<T>>>,
  () => Promise<void>,
  boolean
] {
  const abortController = useMemo(() => new AbortController(), []);
  const initialActionRef = useRef({ actionStatus: 'PotentialActionStatus', ...initialAction });
  const [inputSchema, outputSchema] = useMemo(
    () => buildSchemas<TRequest, TResponse>(initialActionRef.current),
    [initialActionRef]
  );

  const [action, setAction, actionRef] = useStateWithRef<ActionWithActionStatus<T>>(
    omitInputOutputDeep(initialActionRef.current) as ActionWithActionStatus<T>
  );
  const isInputValid = useMemo(() => safeParse(inputSchema, action).success, [action, inputSchema]);

  useEffect(() => () => abortController.abort(), [abortController]);

  const perform = useCallback(async () => {
    const nextAction: ActionWithActionStatus<T> = { ...actionRef.current, actionStatus: 'ActiveActionStatus' };

    setAction({ ...actionRef.current, actionStatus: 'ActiveActionStatus' });

    let response: Output<typeof outputSchema>;

    try {
      const request = parse(inputSchema, nextAction);

      const values = getNamedValues(initialActionRef.current, request);

      const result = await handler(request, values);

      response = parse(outputSchema, { actionStatus: 'CompletedActionStatus', ...result });
    } catch (error) {
      abortController.signal.aborted || setAction({ ...actionRef.current, actionStatus: 'FailedActionStatus' });

      throw error;
    }

    if (!abortController.signal.aborted) {
      setAction(
        action => mergeDeep({ ...action, actionStatus: 'CompletedActionStatus' }, response) as ActionWithActionStatus<T>
      );
    }
  }, [actionRef, handler, initialActionRef, inputSchema, outputSchema, setAction]);

  const state = useMemo(
    () => Object.freeze([action, setAction, perform, isInputValid] as const),
    [action, setAction, perform, isInputValid]
  );

  return state;
}
