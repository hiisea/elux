import {coreConfig, env, ILoadComponent, injectComponent, isPromise} from '@elux/core';
import {defineComponent, h, onBeforeUnmount, shallowRef, watch} from 'vue';

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
      const execute = () => {
        let SyncView: Elux.Component<any> | string = OnLoading;
        try {
          const result = injectComponent(moduleName as string, componentName as string, store);
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
            SyncView = result as any;
          }
        } catch (e: any) {
          env.console.error(e);
          SyncView = e.message || `${e}` || 'error';
        }
        return SyncView;
      };
      const store = coreConfig.UseStore!();
      const View = shallowRef<Elux.Component<any> | string>(execute());
      let active = true;
      onBeforeUnmount(() => {
        active = false;
      });
      watch(() => store.sid, execute);

      return () => {
        const view = View.value;
        if (typeof view === 'string') {
          return h(OnError, {message: view});
        } else if (view === OnLoading) {
          return h(view);
        } else {
          return h(view, props, context.slots);
        }
      };
    },
  }) as any;

  return component;
};
