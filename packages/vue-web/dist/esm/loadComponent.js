import { loadComponet, isPromise, env, defineComponent } from '@elux/core';
import { defineAsyncComponent, h, inject } from 'vue';
export var DepsContext = '__EluxDepsContext__';
var loadComponentDefaultOptions = {
  LoadComponentOnError: function LoadComponentOnError() {
    return h('div', {
      class: 'g-component-error'
    });
  },
  LoadComponentOnLoading: function LoadComponentOnLoading() {
    return h('div', {
      class: 'g-component-loading'
    });
  }
};
export function setLoadComponentOptions(_ref) {
  var LoadComponentOnError = _ref.LoadComponentOnError,
      LoadComponentOnLoading = _ref.LoadComponentOnLoading;
  LoadComponentOnError && (loadComponentDefaultOptions.LoadComponentOnError = LoadComponentOnError);
  LoadComponentOnLoading && (loadComponentDefaultOptions.LoadComponentOnLoading = LoadComponentOnLoading);
}
export var loadComponent = function loadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var loadingComponent = defineComponent(options.OnLoading || loadComponentDefaultOptions.LoadComponentOnLoading);
  var errorComponent = options.OnError || loadComponentDefaultOptions.LoadComponentOnError;

  var component = function component(props, context) {
    var _inject = inject(DepsContext, {
      deps: {}
    }),
        deps = _inject.deps,
        store = _inject.store;

    var result;
    var errorMessage = '';

    try {
      result = loadComponet(moduleName, componentName, store, deps);
    } catch (e) {
      env.console.error(e);
      errorMessage = e.message || "" + e;
    }

    if (result !== undefined) {
      if (result === null) {
        return h(loadingComponent);
      }

      if (isPromise(result)) {
        return h(defineAsyncComponent({
          loader: function loader() {
            return result;
          },
          errorComponent: errorComponent,
          loadingComponent: loadingComponent
        }), props, context.slots);
      }

      return h(result, props, context.slots);
    }

    return h(errorComponent, null, errorMessage);
  };

  return component;
};