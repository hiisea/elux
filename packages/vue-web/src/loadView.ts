import {getComponet, isPromise, env} from '@elux/core';
import type {LoadComponent as BaseLoadComponent, RootModuleFacade} from '@elux/core';
import {defineAsyncComponent, Component, h} from 'vue';

export type LoadView<A extends RootModuleFacade = {}> = BaseLoadComponent<A, {OnError?: Component; OnLoading?: Component}>;

const loadViewDefaultOptions: {LoadViewOnError: Component; LoadViewOnLoading: Component} = {
  LoadViewOnError: () => h('div', {class: 'g-view-error'}),
  LoadViewOnLoading: () => h('div', {class: 'g-view-loading'}),
};

export function setLoadViewOptions({
  LoadViewOnError,
  LoadViewOnLoading,
}: {
  LoadViewOnError?: Component<{message: string}>;
  LoadViewOnLoading?: Component<{}>;
}) {
  LoadViewOnError && (loadViewDefaultOptions.LoadViewOnError = LoadViewOnError);
  LoadViewOnLoading && (loadViewDefaultOptions.LoadViewOnLoading = LoadViewOnLoading);
}

export const loadView: LoadView = (moduleName, viewName, options) => {
  const component: any = (props: any, context: any) => {
    const errorComponent: Component = options?.OnError || loadViewDefaultOptions.LoadViewOnError;
    let result: Component | Promise<Component> | undefined;
    let errorMessage = '';
    try {
      result = getComponet<Component>(moduleName, viewName as string, true);
    } catch (e: any) {
      env.console.error(e);
      errorMessage = e.message || `${e}`;
    }
    if (result) {
      if (isPromise(result)) {
        return h(
          defineAsyncComponent({
            loader: () => result as any,
            errorComponent,
            loadingComponent: options?.OnLoading || loadViewDefaultOptions.LoadViewOnLoading,
          }),
          props,
          context.slots
        );
      }
      return h(result, props, context.slots);
    }
    return h(errorComponent, null, errorMessage);
  };
  return component;
};
