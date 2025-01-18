import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useRefFrom } from 'use-ref-from';
import { safeParse } from 'valibot';
import { actionStatusSchema, ActionStatusType } from './ActionStatusType.ts';
import { type ActionWithActionStatus } from './ActionWithActionStatus.ts';
import extractVariablesFromAction from './private/extractVariablesFromAction.ts';
import mergeVariablesIntoAction from './private/mergeVariablesIntoAction.ts';
import type { VariableMap } from './VariableMap.ts';

type Action = {};

export default function useSchemaOrgAction<T extends Action = Action>(
  initialAction: T,
  handler: (input: VariableMap, init: Readonly<{ signal: AbortSignal }>) => Promise<VariableMap>
): readonly [
  Partial<VariableMap>,
  Dispatch<SetStateAction<VariableMap>>,
  Readonly<{
    action: ActionWithActionStatus<T>;
    isInputValid: boolean;
    submit: () => Promise<void>;
  }>
] {
  const abortController = useMemo(() => new AbortController(), []);
  const handlerRef = useRefFrom(handler);
  const [input, setInput] = useState<VariableMap>(() => extractVariablesFromAction(initialAction, 'input'));
  const [output, setOutput] = useState<VariableMap>(() => extractVariablesFromAction(initialAction, 'output'));
  const initialActionRef = useRefFrom(initialAction);
  const [actionStatus, setActionStatus] = useState<ActionStatusType>(() => {
    if ('actionStatus' in initialAction) {
      const result = safeParse(actionStatusSchema, initialAction.actionStatus);

      if (result.success) {
        return result.output;
      }
    }

    return 'PotentialActionStatus';
  });

  const { isValid, value } = useMemo<{ isValid: boolean; value: ActionWithActionStatus<T> }>(() => {
    const { isValid: isInputValid, value: actionWithInput } = mergeVariablesIntoAction<ActionWithActionStatus<T>>(
      { ...initialActionRef.current, actionStatus },
      input,
      'input'
    );

    return {
      isValid: isInputValid,
      value: mergeVariablesIntoAction<ActionWithActionStatus<T>>(actionWithInput, output, 'output').value
    };
  }, [actionStatus, initialActionRef, input, output]);

  const inputRef = useRefFrom(input);
  const isValidRef = useRefFrom(isValid);

  const submit = useCallback<() => Promise<void>>(async () => {
    if (!isValidRef.current) {
      setActionStatus('FailedActionStatus');

      return Promise.reject(Error('Input is invalid, cannot submit.'));
    }

    setActionStatus('ActiveActionStatus');

    const output = await handlerRef.current(inputRef.current, { signal: abortController.signal });

    if (!mergeVariablesIntoAction(initialActionRef.current, output, 'output').isValid) {
      return Promise.reject(Error('Output is invalid.'));
    }

    if (!abortController.signal.aborted) {
      setActionStatus('CompletedActionStatus');
      setOutput(output);
    }
  }, [abortController, handlerRef, initialActionRef, inputRef, isValidRef, setActionStatus, setOutput]);

  const options = useMemo(
    () =>
      Object.freeze({
        action: value,
        isInputValid: isValid,
        submit
      }),
    [isValid, submit, value]
  );

  useEffect(() => () => abortController.abort(), [abortController]);

  return useMemo(() => Object.freeze([input, setInput, options] as const), [input, options, setInput]);
}
