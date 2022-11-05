import _extends from "@babel/runtime/helpers/esm/extends";
import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
export var LoadComponentOnError = function LoadComponentOnError(_ref) {
  var message = _ref.message;
  return _jsx("div", {
    className: "g-component-error",
    children: message
  });
};
export var LoadComponentOnLoading = function LoadComponentOnLoading() {
  return _jsx("div", {
    className: "g-component-loading",
    children: "loading..."
  });
};
export var LoadComponent = function LoadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  var OnError = options.onError || coreConfig.LoadComponentOnError;
  var Component = forwardRef(function (props, ref) {
    var activeRef = useRef(true);
    var viewRef = useRef(OnLoading);
    var curStore = coreConfig.UseStore();

    var _useState = useState(viewRef.current),
        setView = _useState[1];

    var update = useCallback(function (view) {
      if (activeRef.current) {
        viewRef.current = view;
      }

      setView(view);
    }, []);
    useMemo(function () {
      var SyncView = OnLoading;

      try {
        var result = injectComponent(moduleName, componentName, curStore);

        if (isPromise(result)) {
          if (env.isServer) {
            throw 'can not use async component in SSR';
          }

          result.then(function (view) {
            update(view || 'not found!');
          }, function (e) {
            env.console.error(e);
            update(e.message || "" + e || 'error');
          });
        } else {
          SyncView = result;
        }
      } catch (e) {
        env.console.error(e);
        SyncView = e.message || "" + e || 'error';
      }

      update(SyncView);
    }, [curStore, update]);
    useEffect(function () {
      return function () {
        activeRef.current = false;
      };
    }, []);
    var View = viewRef.current;

    if (typeof View === 'string') {
      return _jsx(OnError, {
        message: View
      });
    } else if (View === OnLoading) {
      return _jsx(OnLoading, {});
    } else {
      return _jsx(View, _extends({
        ref: ref
      }, props));
    }
  });
  Component.displayName = 'EluxComponentLoader';
  return Component;
};