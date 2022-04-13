import { createTextVNode as _createTextVNode, createVNode as _createVNode } from "vue";
import { defineAsyncComponent, h } from 'vue';
import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
export const LoadComponentOnError = ({
  message
}) => _createVNode("div", {
  "class": "g-component-error"
}, [message]);
export const LoadComponentOnLoading = () => _createVNode("div", {
  "class": "g-component-loading"
}, [_createTextVNode("loading...")]);
export const LoadComponent = (moduleName, componentName, options = {}) => {
  const loadingComponent = options.onLoading || coreConfig.LoadComponentOnLoading;
  const errorComponent = options.onError || coreConfig.LoadComponentOnError;

  const component = (props, context) => {
    const store = coreConfig.UseStore();
    let result;
    let errorMessage = '';

    try {
      result = injectComponent(moduleName, componentName, store);

      if (env.isServer && isPromise(result)) {
        result = undefined;
        throw 'can not use async component in SSR';
      }
    } catch (e) {
      env.console.error(e);
      errorMessage = e.message || `${e}`;
    }

    if (result) {
      if (isPromise(result)) {
        return h(defineAsyncComponent({
          loader: () => result,
          errorComponent,
          loadingComponent
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