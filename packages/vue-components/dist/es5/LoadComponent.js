import { createTextVNode as _createTextVNode, createVNode as _createVNode } from "vue";
import { defineAsyncComponent, h } from 'vue';
import { env, injectComponent, isPromise, coreConfig } from '@elux/core';
export var LoadComponentOnError = function LoadComponentOnError(_ref) {
  var message = _ref.message;
  return _createVNode("div", {
    "class": "g-component-error"
  }, [message]);
};
export var LoadComponentOnLoading = function LoadComponentOnLoading() {
  return _createVNode("div", {
    "class": "g-component-loading"
  }, [_createTextVNode("loading...")]);
};
export var LoadComponent = function LoadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var loadingComponent = options.onLoading || coreConfig.LoadComponentOnLoading;
  var errorComponent = options.onError || coreConfig.LoadComponentOnError;

  var component = function component(props, context) {
    var store = coreConfig.UseStore();
    var result;
    var errorMessage = '';

    try {
      result = injectComponent(moduleName, componentName, store);

      if (env.isServer && isPromise(result)) {
        result = undefined;
        throw 'can not use async component in SSR';
      }
    } catch (e) {
      env.console.error(e);
      errorMessage = e.message || "" + e;
    }

    if (result) {
      if (isPromise(result)) {
        return h(defineAsyncComponent({
          loader: function loader() {
            return result;
          },
          errorComponent: errorComponent,
          loadingComponent: loadingComponent
        }), props, context.slots);
      } else {
        return h(result, props, context.slots);
      }
    } else {
      return h(errorComponent, null, errorMessage);
    }
  };

  return component;
};