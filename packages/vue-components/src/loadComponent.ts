import {loadComponent as baseLoadComponent, isPromise, env} from '@elux/core';
import type {LoadComponent, EluxComponent, EStore} from '@elux/core';
import {defineAsyncComponent, Component, h, inject} from 'vue';
import {EluxContext, EluxContextKey, EluxStoreContext, EluxStoreContextKey, vueComponentsConfig} from './base';

/**
 * EluxUI组件加载参数
 *
 * @remarks
 * EluxUI组件加载参见 {@link LoadComponent}，加载参数可通过 {@link setConfig | setConfig(...)} 设置全局默认，
 * 也可以直接在 `LoadComponent(...)` 中特别指明
 *
 * @example
 * ```js
 *   const OnError = ({message}) => <div>{message}</div>
 *   const OnLoading = () => <div>loading...</div>
 *
 *   const Article = LoadComponent('article', 'main', {OnLoading, OnError})
 * ```
 *
 * @public
 */
export interface LoadComponentOptions {
  OnError?: Component<{message: string}>;
  OnLoading?: Component<{}>;
}

export const loadComponent: LoadComponent<Record<string, any>, LoadComponentOptions> = (moduleName, componentName, options = {}) => {
  const loadingComponent = options.OnLoading || vueComponentsConfig.LoadComponentOnLoading;
  const errorComponent = options.OnError || vueComponentsConfig.LoadComponentOnError;

  const component: any = (props: any, context: any) => {
    const {deps} = inject<EluxContext>(EluxContextKey, {documentHead: ''});
    const {store} = inject<EluxStoreContext>(EluxStoreContextKey, {store: null as any});
    let result: EluxComponent | null | Promise<EluxComponent | null> | undefined;
    let errorMessage = '';
    try {
      result = baseLoadComponent(moduleName, componentName as string, store as EStore, deps || {});
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
