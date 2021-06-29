import {loadComponet, isPromise, env, defineComponent} from '@elux/core';
import type {LoadComponent as BaseLoadComponent, RootModuleFacade, EluxComponent, IStore} from '@elux/core';
import {defineAsyncComponent, Component, h, inject} from 'vue';

export const DepsContext = '__EluxDepsContext__';
export type LoadComponent<A extends RootModuleFacade = {}> = BaseLoadComponent<A, {OnError?: Component; OnLoading?: Component}>;

const loadComponentDefaultOptions: {LoadComponentOnError: Component; LoadComponentOnLoading: Component} = {
  LoadComponentOnError: () => h('div', {class: 'g-component-error'}),
  LoadComponentOnLoading: () => h('div', {class: 'g-component-loading'}),
};

export function setLoadComponentOptions({
  LoadComponentOnError,
  LoadComponentOnLoading,
}: {
  LoadComponentOnError?: Component<{message: string}>;
  LoadComponentOnLoading?: Component<{}>;
}) {
  LoadComponentOnError && (loadComponentDefaultOptions.LoadComponentOnError = LoadComponentOnError);
  LoadComponentOnLoading && (loadComponentDefaultOptions.LoadComponentOnLoading = LoadComponentOnLoading);
}

export const loadComponent: LoadComponent = (moduleName, componentName, options = {}) => {
  const loadingComponent: EluxComponent = defineComponent(options.OnLoading || loadComponentDefaultOptions.LoadComponentOnLoading);
  const errorComponent = options.OnError || loadComponentDefaultOptions.LoadComponentOnError;
  const component: any = (props: any, context: any) => {
    const {deps, store} = inject<{deps: Record<string, boolean>; store?: IStore}>(DepsContext, {deps: {}});
    let result: EluxComponent | null | Promise<EluxComponent | null> | undefined;
    let errorMessage = '';
    try {
      result = loadComponet(moduleName, componentName as string, store!, deps);
    } catch (e: any) {
      env.console.error(e);
      errorMessage = e.message || `${e}`;
    }
    if (result !== undefined) {
      if (result === null) {
        return h(loadingComponent);
      }
      if (isPromise(result)) {
        return h(
          defineAsyncComponent({
            loader: () => result as any,
            errorComponent,
            loadingComponent,
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
