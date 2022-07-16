import _extends from "@babel/runtime/helpers/esm/extends";
import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
import { forwardRef, useEffect, useRef, useState } from 'react';
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
    var execute = function execute(curStore) {
      var SyncView = OnLoading;

      try {
        var result = injectComponent(moduleName, componentName, curStore || store);

        if (isPromise(result)) {
          if (env.isServer) {
            throw 'can not use async component in SSR';
          }

          result.then(function (view) {
            activeRef.current && setView(view || 'not found!');
          }, function (e) {
            env.console.error(e);
            activeRef.current && setView(e.message || "" + e || 'error');
          });
        } else {
          SyncView = result;
        }
      } catch (e) {
        env.console.error(e);
        SyncView = e.message || "" + e || 'error';
      }

      return SyncView;
    };

    var activeRef = useRef(true);
    useEffect(function () {
      return function () {
        activeRef.current = false;
      };
    }, []);
    var newStore = coreConfig.UseStore();

    var _useState = useState(newStore),
        store = _useState[0],
        setStore = _useState[1];

    var _useState2 = useState(execute),
        View = _useState2[0],
        setView = _useState2[1];

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
      return _jsx(View, _extends({
        ref: ref
      }, props));
    }
  });
  Component.displayName = 'EluxComponentLoader';
  return Component;
};