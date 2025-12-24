/* istanbul ignore file */

/// <reference types="node" />

type RenderHookResult<T = unknown, P = unknown> = {
  rerender: (props: P) => void;
  result: { current: T };
  unmount: () => void;
};

const renderHook: <T, P>(render: (props: P) => T, options?: { initialProps: P }) => RenderHookResult<T, P> =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@testing-library/react').renderHook ||
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@testing-library/react-hooks').renderHook;

export default renderHook;
export { type RenderHookResult };
