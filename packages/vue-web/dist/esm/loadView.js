import { getComponet, isPromise, env } from '@elux/core';
import { defineAsyncComponent, h } from 'vue';
var loadViewDefaultOptions = {
  LoadViewOnError: function LoadViewOnError() {
    return h('div', {
      class: 'g-view-error'
    });
  },
  LoadViewOnLoading: function LoadViewOnLoading() {
    return h('div', {
      class: 'g-view-loading'
    });
  }
};
export function setLoadViewOptions(_ref) {
  var LoadViewOnError = _ref.LoadViewOnError,
      LoadViewOnLoading = _ref.LoadViewOnLoading;
  LoadViewOnError && (loadViewDefaultOptions.LoadViewOnError = LoadViewOnError);
  LoadViewOnLoading && (loadViewDefaultOptions.LoadViewOnLoading = LoadViewOnLoading);
}
export var loadView = function loadView(moduleName, viewName, options) {
  var component = function component(props, context) {
    var errorComponent = (options == null ? void 0 : options.OnError) || loadViewDefaultOptions.LoadViewOnError;
    var result;
    var errorMessage = '';

    try {
      result = getComponet(moduleName, viewName, true);
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
          loadingComponent: (options == null ? void 0 : options.OnLoading) || loadViewDefaultOptions.LoadViewOnLoading
        }), props, context.slots);
      }

      return h(result, props, context.slots);
    }

    return h(errorComponent, null, errorMessage);
  };

  return component;
};