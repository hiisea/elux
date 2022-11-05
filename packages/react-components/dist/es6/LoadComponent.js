import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    const activeRef = useRef(true);
    const viewRef = useRef(OnLoading);
    const curStore = coreConfig.UseStore();
    const [, setView] = useState(viewRef.current);
    const update = useCallback(view => {
      if (activeRef.current) {
        viewRef.current = view;
      }

      setView(view);
    }, []);
    useMemo(() => {
      let SyncView = OnLoading;

      try {
        const result = injectComponent(moduleName, componentName, curStore);

        if (isPromise(result)) {
          if (env.isServer) {
            throw 'can not use async component in SSR';
          }

          result.then(view => {
            update(view || 'not found!');
          }, e => {
            env.console.error(e);
            update(e.message || `${e}` || 'error');
          });
        } else {
          SyncView = result;
        }
      } catch (e) {
        env.console.error(e);
        SyncView = e.message || `${e}` || 'error';
      }

      update(SyncView);
    }, [curStore, update]);
    useEffect(() => {
      return () => {
        activeRef.current = false;
      };
    }, []);
    const View = viewRef.current;

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