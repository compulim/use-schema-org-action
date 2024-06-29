import merge from 'lodash/merge';
import { useCallback, useEffect, useMemo, useRef, type Dispatch, type SetStateAction } from 'react';
import { useStateWithRef } from 'use-state-with-ref';
import { parse, safeParse, type InferOutput } from 'valibot';

import { type ActionWithActionStatus } from './ActionWithActionStatus';
import buildSchemas, { type SchemaOrgSchema } from './private/buildSchemas';
import getNamedVariables from './private/getNamedVariables';
import omitInputOutputDeep from './private/omitInputOutputDeep';

type Action = object;

export default function useSchemaOrgAction<T extends Action, TResponse extends Partial<T> = Partial<T>>(
  initialAction: T,
  handler: (
    request: Readonly<InferOutput<SchemaOrgSchema>>,
    variables: ReadonlyMap<string, unknown>
  ) => Promise<Readonly<TResponse>>
): readonly [
  ActionWithActionStatus<T>,
  Dispatch<SetStateAction<ActionWithActionStatus<T>>>,
  () => Promise<void>,
  boolean
] {
  const abortController = useMemo(() => new AbortController(), []);
  const initialActionRef = useRef({ actionStatus: 'PotentialActionStatus', ...initialAction });
  const [inputSchema, outputSchema] = useMemo(() => buildSchemas(initialActionRef.current), [initialActionRef]);

  const [action, setAction, actionRef] = useStateWithRef<ActionWithActionStatus<T>>(
    omitInputOutputDeep(initialActionRef.current) as ActionWithActionStatus<T>
  );
  const isInputValid = useMemo(() => safeParse(inputSchema, action).success, [action, inputSchema]);

  useEffect(() => () => abortController.abort(), [abortController]);

  const perform = useCallback(async () => {
    const nextAction: ActionWithActionStatus<T> = { ...actionRef.current, actionStatus: 'ActiveActionStatus' };

    setAction({ ...actionRef.current, actionStatus: 'ActiveActionStatus' });

    let response: InferOutput<typeof outputSchema>;

    try {
      const request = Object.freeze(parse(inputSchema, nextAction));

      const variables = getNamedVariables(initialActionRef.current, request);

      const result = await handler(request, variables);

      response = Object.freeze(parse(outputSchema, { actionStatus: 'CompletedActionStatus', ...result }));
    } catch (error) {
      abortController.signal.aborted || setAction({ ...actionRef.current, actionStatus: 'FailedActionStatus' });

      throw error;
    }

    if (!abortController.signal.aborted) {
      setAction(
        action => merge({}, action, { actionStatus: 'CompletedActionStatus' }, response) as ActionWithActionStatus<T>
      );
    }
  }, [actionRef, handler, initialActionRef, inputSchema, outputSchema, setAction]);

  const state = useMemo(
    () => Object.freeze([action, setAction, perform, isInputValid] as const),
    [action, setAction, perform, isInputValid]
  );

  return state;
}
