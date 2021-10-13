import { loadComponet, isPromise, env } from '@elux/core';
import { defineAsyncComponent, h, inject } from 'vue';
import { EluxContextKey, EluxStoreContextKey, vueComponentsConfig } from './base';

var loadComponent = function loadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var loadingComponent = options.OnLoading || vueComponentsConfig.LoadComponentOnLoading;
  var errorComponent = options.OnError || vueComponentsConfig.LoadComponentOnError;

  var component = function component(props, context) {
    var _inject = inject(EluxContextKey, {
      documentHead: ''
    }),
        deps = _inject.deps;

    var _inject2 = inject(EluxStoreContextKey, {
      store: null
    }),
        store = _inject2.store;

    var result;
    var errorMessage = '';

    try {
      result = loadComponet(moduleName, componentName, store, deps || {});
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

export default loadComponent;