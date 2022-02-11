import {loadComponent, isPromise, env} from '@elux/core';
import type {LoadComponent, EluxComponent, EStore} from '@elux/core';
import {defineAsyncComponent, Component, h, inject} from 'vue';
import {EluxContext, EluxContextKey, EluxStoreContext, EluxStoreContextKey, vueComponentsConfig} from './base';

/*** @public */
export interface LoadComponentOptions {
  OnError?: Component<{message: string}>;
  OnLoading?: Component<{}>;
}

const vueLoadComponent: LoadComponent<Record<string, any>, LoadComponentOptions> = (moduleName, componentName, options = {}) => {
  const loadingComponent = options.OnLoading || vueComponentsConfig.LoadComponentOnLoading;
  const errorComponent = options.OnError || vueComponentsConfig.LoadComponentOnError;

  const component: any = (props: any, context: any) => {
    const {deps} = inject<EluxContext>(EluxContextKey, {documentHead: ''});
    const {store} = inject<EluxStoreContext>(EluxStoreContextKey, {store: null as any});
    let result: EluxComponent | null | Promise<EluxComponent | null> | undefined;
    let errorMessage = '';
    try {
      result = loadComponent(moduleName, componentName as string, store as EStore, deps || {});
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
export default vueLoadComponent;
