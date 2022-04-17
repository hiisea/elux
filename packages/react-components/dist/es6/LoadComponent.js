import React, { useEffect, useState } from 'react';
import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
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
  return React.forwardRef((props, ref) => {
    const execute = curStore => {
      let View = OnLoading;

      try {
        const result = injectComponent(moduleName, componentName, curStore || store);

        if (isPromise(result)) {
          if (env.isServer) {
            throw 'can not use async component in SSR';
          }

          result.then(view => {
            active && setView(view || 'not found!');
          }, e => {
            env.console.error(e);
            active && setView(e.message || `${e}` || 'error');
          });
        } else {
          View = result;
        }
      } catch (e) {
        env.console.error(e);
        View = e.message || `${e}` || 'error';
      }

      return View;
    };

    const [active, setActive] = useState(true);
    useEffect(() => {
      return () => {
        setActive(false);
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
    } else {
      return _jsx(View, {
        ref: ref,
        ...props
      });
    }
  });
};