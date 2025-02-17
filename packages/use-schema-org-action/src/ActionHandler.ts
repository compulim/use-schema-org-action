import { type ActionState } from "./ActionState";
import { type VariableMap } from "./VariableMap";

/**
 * When called, should perform the action and return action state containing all properties with output constraints.
 *
 * @param request Input properties validated against input constraints
 * @param inputVariables `Map` of input variables for URL template expansion.
 * @returns Output properties and will be validated against output constraints.
 */
export type ActionHandler = (
  request: ActionState,
  inputVariables: VariableMap,
  init: Readonly<{
    /** `AbortSignal` for detecting early unmount. */
    signal: AbortSignal;
  }>
) => Promise<ActionState>;
