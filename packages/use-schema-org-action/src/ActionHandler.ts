import { type ActionState } from './ActionState.ts';
import { type VariableMap } from './VariableMap.ts';

/**
 * When called, should perform the action and return action state containing all properties with output constraints.
 *
 * @param request Input properties validated against input constraints.
 * @param inputVariables `Map` of input variables for URL template expansion.
 * @returns Output properties, will merge into action state after validated against output constraints.
 */
export type ActionHandler = (
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
  inputVariables: VariableMap,
  init: Readonly<{
    /** `AbortSignal` for detecting early unmount. */
    signal: AbortSignal;
  }>
) => Promise<ActionState>;
