import { loadComponet, isPromise, env } from '@elux/core';
import { defineAsyncComponent, h, inject } from 'vue';
import { EluxContextKey, vueComponentsConfig } from './base';

const loadComponent = (moduleName, componentName, options = {}) => {
  const loadingComponent = options.OnLoading || vueComponentsConfig.LoadComponentOnLoading;
  const errorComponent = options.OnError || vueComponentsConfig.LoadComponentOnError;

  const component = (props, context) => {
    const {
      deps,
      store
    } = inject(EluxContextKey, {
      documentHead: ''
    });
    let result;
    let errorMessage = '';

    try {
      result = loadComponet(moduleName, componentName, store, deps || {});
    } catch (e) {
      env.console.error(e);
      errorMessage = e.message || `${e}`;
    }

    if (result !== undefined) {
      if (result === null) {
        return h(loadingComponent);
      }

      if (isPromise(result)) {
        return h(defineAsyncComponent({
          loader: () => result,
          errorComponent,
          loadingComponent
        }), props, context.slots);
      }

      return h(result, props, context.slots);
    }

    return h(errorComponent, null, errorMessage);
  };

  return component;
};

export default loadComponent;