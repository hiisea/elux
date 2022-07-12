import { buildConfigSetter, env } from '@elux/core';
import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
export const EluxContextComponent = createContext({
  router: null
});
export function UseRouter() {
  const eluxContext = useContext(EluxContextComponent);
  return eluxContext.router;
}
export const reactComponentsConfig = {
  hydrate: undefined,
  render: undefined,
  renderToString: undefined
};
export const setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);
export function useEventCallback(fn, dependencies) {
  const ref = useRef((...args) => {
    env.console.log(new Error('Cannot call an event handler while rendering.'));
  });
  useEffect(() => {
    ref.current = fn;
  }, [fn, ...dependencies]);
  return useCallback((...args) => {
    const fun = ref.current;
    return fun(...args);
  }, [ref]);
}