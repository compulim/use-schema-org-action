import isPlainObject from './isPlainObject.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionState = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeActionStateRecursiveInternal<T extends Record<string, any>>(
  action: T,
  base: ActionState | undefined,
  update: ActionState | undefined,
  mode: 'input' | 'output'
): ActionState | undefined {
  const nextActionState: ActionState = base ? { ...base } : {};

  for (const [key, value] of Object.entries(action)) {
    if (mode === 'input' && key.endsWith('-input')) {
      const unprefixedKey = key.slice(0, -6);

      nextActionState[unprefixedKey] = update?.[unprefixedKey] ?? base?.[unprefixedKey];
    } else if (mode === 'output' && key.endsWith('-output')) {
      const unprefixedKey = key.slice(0, -7);

      nextActionState[unprefixedKey] = update?.[unprefixedKey] ?? base?.[unprefixedKey];
    } else if (isPlainObject(value)) {
      const subValue = mergeActionStateRecursiveInternal(value, base?.[key], update?.[key], mode);

      if (typeof subValue !== 'undefined') {
        nextActionState[key] = subValue;
      }
    }
  }

  return Object.entries(nextActionState).length ? nextActionState : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function mergeActionStateRecursive<T extends Record<string, any>>(
  action: T,
  base: ActionState | undefined,
  update: ActionState | undefined,
  mode: 'input' | 'output'
): ActionState {
  return mergeActionStateRecursiveInternal<T>(action, base, update, mode) || {};
}
