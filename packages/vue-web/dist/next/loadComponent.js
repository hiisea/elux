import { loadComponet, isPromise, env } from '@elux/core';
import { defineAsyncComponent, h, inject } from 'vue';
import { EluxContextKey } from './sington';
const loadComponentDefaultOptions = {
  LoadComponentOnError: () => h('div', {
    class: 'g-component-error'
  }),
  LoadComponentOnLoading: () => h('div', {
    class: 'g-component-loading'
  })
};
export function setLoadComponentOptions({
  LoadComponentOnError,
  LoadComponentOnLoading
}) {
  LoadComponentOnError && (loadComponentDefaultOptions.LoadComponentOnError = LoadComponentOnError);
  LoadComponentOnLoading && (loadComponentDefaultOptions.LoadComponentOnLoading = LoadComponentOnLoading);
}
export const loadComponent = (moduleName, componentName, options = {}) => {
  const loadingComponent = options.OnLoading || loadComponentDefaultOptions.LoadComponentOnLoading;
  const errorComponent = options.OnError || loadComponentDefaultOptions.LoadComponentOnError;

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