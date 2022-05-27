import _extends from "@babel/runtime/helpers/esm/extends";
import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
import { forwardRef, useEffect, useState } from 'react';
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
      var View = OnLoading;

      try {
        var result = injectComponent(moduleName, componentName, curStore || store);

        if (isPromise(result)) {
          if (env.isServer) {
            throw 'can not use async component in SSR';
          }

          result.then(function (view) {
            active && setView(view || 'not found!');
          }, function (e) {
            env.console.error(e);
            active && setView(e.message || "" + e || 'error');
          });
        } else {
          View = result;
        }
      } catch (e) {
        env.console.error(e);
        View = e.message || "" + e || 'error';
      }

      return View;
    };

    var _useState = useState(true),
        active = _useState[0],
        setActive = _useState[1];

    useEffect(function () {
      return function () {
        setActive(false);
      };
    }, []);
    var newStore = coreConfig.UseStore();

    var _useState2 = useState(newStore),
        store = _useState2[0],
        setStore = _useState2[1];

    var _useState3 = useState(execute),
        View = _useState3[0],
        setView = _useState3[1];

    if (store !== newStore) {
      setStore(newStore);
      setView(execute(newStore));
    }

    if (typeof View === 'string') {
      return _jsx(OnError, {
        message: View
      });
    } else {
      return _jsx(View, _extends({
        ref: ref
      }, props));
    }
  });
  Component.displayName = 'EluxComponentLoader';
  return Component;
};