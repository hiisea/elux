import {coreConfig, env, ILoadComponent, injectComponent, isPromise, IStore} from '@elux/core';
import {defineComponent, h, onBeforeUnmount, shallowRef} from 'vue';

export const LoadComponentOnError: Elux.Component<{message: string}> = ({message}: {message: string}) => (
  <div class="g-component-error">{message}</div>
);
export const LoadComponentOnLoading: Elux.Component = () => <div class="g-component-loading">loading...</div>;

export const LoadComponent: ILoadComponent<any> = (moduleName, componentName, options = {}) => {
  const OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading!;
  const OnError = options.onError || coreConfig.LoadComponentOnError!;

  const component: Elux.Component<any> = defineComponent({
    name: 'EluxComponentLoader',
    setup(props: any, context: any) {
      const store = coreConfig.UseStore!();
      const View = shallowRef<Elux.Component<any> | string>(OnLoading);
      const execute = (curStore?: IStore) => {
        try {
          const result = injectComponent(moduleName as string, componentName as string, curStore || store);
          if (isPromise(result)) {
            if (env.isServer) {
              throw 'can not use async component in SSR';
            }
            result.then(
              (view: any) => {
                active && (View.value = view || 'not found!');
              },
              (e) => {
                env.console.error(e);
                active && (View.value = e.message || `${e}` || 'error');
              }
            );
          } else {
            View.value = result as any;
          }
        } catch (e: any) {
          env.console.error(e);
          View.value = e.message || `${e}` || 'error';
        }
      };
      let active = true;
      onBeforeUnmount(() => {
        active = false;
      });
      execute();
      return () => {
        if (typeof View.value === 'string') {
          return h(OnError, {message: View.value});
        } else {
          return h(View.value, props, context.slots);
        }
      };
    },
  }) as any;

  //   const component: any = (props: any, context: any) => {
  //     const store = coreConfig.UseStore!();
  //     let result: EluxComponent | Promise<EluxComponent> | undefined;
  //     let errorMessage = '';
  //     try {
  //       result = injectComponent(moduleName as string, componentName as string, store);
  //       if (env.isServer && isPromise(result)) {
  //         result = undefined;
  //         throw 'can not use async component in SSR';
  //       }
  //     } catch (e: any) {
  //       env.console.error(e);
  //       errorMessage = e.message || `${e}`;
  //     }
  //     if (result) {
  //       if (isPromise(result)) {
  //         return h(
  //           defineAsyncComponent({
  //             loader: () => result as any,
  //             errorComponent,
  //             loadingComponent,
  //           }),
  //           props,
  //           context.slots
  //         );
  //       } else {
  //         return h(result, props, context.slots);
  //       }
  //     } else {
  //       return h(errorComponent, null, errorMessage);
  //     }
  //   };
  return component;
};
