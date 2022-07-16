import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
export const LoadComponentOnError = ({
  message
}) => _jsx("div", {
  className: "g-component-error",
  children: message
});
export const LoadComponentOnLoading = () => _jsx("div", {
  className: "g-component-loading",
  children: "loading..."
});
export const LoadComponent = (moduleName, componentName, options = {}) => {
  const OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  const OnError = options.onError || coreConfig.LoadComponentOnError;
  const Component = forwardRef((props, ref) => {
    const execute = curStore => {
      let SyncView = OnLoading;

      try {
        const result = injectComponent(moduleName, componentName, curStore || store);

        if (isPromise(result)) {
          if (env.isServer) {
            throw 'can not use async component in SSR';
          }

          result.then(view => {
            activeRef.current && setView(view || 'not found!');
          }, e => {
            env.console.error(e);
            activeRef.current && setView(e.message || `${e}` || 'error');
          });
        } else {
          SyncView = result;
        }
      } catch (e) {
        env.console.error(e);
        SyncView = e.message || `${e}` || 'error';
      }

      return SyncView;
    };

    const activeRef = useRef(true);
    useEffect(() => {
      return () => {
        activeRef.current = false;
      };
    }, []);
    const newStore = coreConfig.UseStore();
    const [store, setStore] = useState(newStore);
    const [View, setView] = useState(execute);

    if (store !== newStore) {
      setStore(newStore);
      setView(execute(newStore));
    }

    if (typeof View === 'string') {
      return _jsx(OnError, {
        message: View
      });
    } else if (View === OnLoading) {
      return _jsx(OnLoading, {});
    } else {
      return _jsx(View, {
        ref: ref,
        ...props
      });
    }
  });
  Component.displayName = 'EluxComponentLoader';
  return Component;
};