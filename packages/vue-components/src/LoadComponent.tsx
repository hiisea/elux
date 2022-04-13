import {defineAsyncComponent, h} from 'vue';

import {coreConfig, EluxComponent, env, ILoadComponent, injectComponent, isPromise} from '@elux/core';

export const LoadComponentOnError: Elux.Component<{message: string}> = ({message}: {message: string}) => (
  <div class="g-component-error">{message}</div>
);
export const LoadComponentOnLoading: Elux.Component = () => <div class="g-component-loading">loading...</div>;

export const LoadComponent: ILoadComponent<any> = (moduleName, componentName, options = {}) => {
  const loadingComponent = options.onLoading || coreConfig.LoadComponentOnLoading!;
  const errorComponent = options.onError || coreConfig.LoadComponentOnError!;

  const component: any = (props: any, context: any) => {
    const store = coreConfig.UseStore!();
    let result: EluxComponent | Promise<EluxComponent> | undefined;
    let errorMessage = '';
    try {
      result = injectComponent(moduleName as string, componentName as string, store);
      if (env.isServer && isPromise(result)) {
        result = undefined;
        throw 'can not use async component in SSR';
      }
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
            loadingComponent,
          }),
          props,
          context.slots
        );
      } else {
        return h(result, props, context.slots);
      }
    } else {
      return h(errorComponent, null, errorMessage);
    }
  };
  return component;
};
