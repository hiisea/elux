import { getComponet, isPromise, env } from '@elux/core';
import { defineAsyncComponent, h } from 'vue';
const loadViewDefaultOptions = {
  LoadViewOnError: () => h('div', {
    class: 'g-view-error'
  }),
  LoadViewOnLoading: () => h('div', {
    class: 'g-view-loading'
  })
};
export function setLoadViewOptions({
  LoadViewOnError,
  LoadViewOnLoading
}) {
  LoadViewOnError && (loadViewDefaultOptions.LoadViewOnError = LoadViewOnError);
  LoadViewOnLoading && (loadViewDefaultOptions.LoadViewOnLoading = LoadViewOnLoading);
}
export const loadView = (moduleName, viewName, options) => {
  const component = (props, context) => {
    const errorComponent = (options == null ? void 0 : options.OnError) || loadViewDefaultOptions.LoadViewOnError;
    let result;
    let errorMessage = '';

    try {
      result = getComponet(moduleName, viewName, true);
    } catch (e) {
      env.console.error(e);
      errorMessage = e.message || `${e}`;
    }

    if (result) {
      if (isPromise(result)) {
        return h(defineAsyncComponent({
          loader: () => result,
          errorComponent,
          loadingComponent: (options == null ? void 0 : options.OnLoading) || loadViewDefaultOptions.LoadViewOnLoading
        }), props, context.slots);
      }

      return h(result, props, context.slots);
    }

    return h(errorComponent, null, errorMessage);
  };

  return component;
};