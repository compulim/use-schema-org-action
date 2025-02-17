import { type ActionState } from '../ActionState';
import mergeActionStateRecursive from './mergeActionStateRecursive';

export default function extractActionStateFromAction<T extends Record<string, any>>(action: T): ActionState {
  return mergeActionStateRecursive(action, mergeActionStateRecursive(action, {}, action, 'input'), action, 'output');
}
