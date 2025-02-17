import { type ActionState } from '../ActionState.ts';
import mergeActionStateRecursive from './mergeActionStateRecursive.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function extractActionStateFromAction<T extends Record<string, any>>(action: T): ActionState {
  return mergeActionStateRecursive(action, mergeActionStateRecursive(action, {}, action, 'input'), action, 'output');
}
