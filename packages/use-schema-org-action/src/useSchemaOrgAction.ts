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

export default function useSchemaOrgAction<T extends Action>(
  initialAction: T
): [
  ActionWithActionStatus<T>,
  Dispatch<SetStateAction<ActionWithActionStatus<T>>>,
  (
    fn: (action: ActionWithActionStatus<T>, values: Map<string, unknown>) => Promise<Partial<ActionWithActionStatus<T>>>
  ) => Promise<void>,
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

  const perform = useCallback(
    async (fn: (action: ActionWithActionStatus<T>, values: Map<string, unknown>) => Promise<Partial<T>>) => {
      const nextAction: ActionWithActionStatus<T> = { ...actionRef.current, actionStatus: 'ActiveActionStatus' };

      setAction({ ...actionRef.current, actionStatus: 'ActiveActionStatus' });

      let output: Output<typeof outputSchema> | undefined = undefined;

      try {
        const input = parse(inputSchema, nextAction);

        const values = getNamedValues(initialActionRef.current, input);

        const result = await fn(nextAction, values);

        output = parse(outputSchema, { actionStatus: 'CompletedActionStatus', ...result });
      } catch (error) {
        abortController.signal.aborted || setAction({ ...actionRef.current, actionStatus: 'FailedActionStatus' });

        throw error;
      }

      if (!abortController.signal.aborted) {
        setAction(
          action => mergeDeep({ ...action, actionStatus: 'CompletedActionStatus' }, output) as ActionWithActionStatus<T>
        );
      }
    },
    [actionRef, initialActionRef, inputSchema, outputSchema, setAction]
  );

  return [action, setAction, perform, isInputValid];
}
