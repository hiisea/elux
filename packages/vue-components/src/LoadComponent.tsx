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
      let active = true;
      const viewRef = shallowRef<Elux.Component<any> | string>(OnLoading);
      const store = coreConfig.UseStore!();

      const update = (view: Elux.Component<any> | string) => {
        if (active) {
          viewRef.value = view;
        }
      };
      watch(
        () => store.sid,
        () => {
          let SyncView: Elux.Component<any> | string = OnLoading;
          try {
            const result = injectComponent(moduleName as string, componentName as string, store);
            if (isPromise(result)) {
              if (env.isServer) {
                throw 'can not use async component in SSR';
              }
              result.then(
                (view: any) => {
                  update(view || 'not found!');
                },
                (e) => {
                  env.console.error(e);
                  update(e.message || `${e}` || 'error');
                }
              );
            } else {
              SyncView = result as any;
            }
          } catch (e: any) {
            env.console.error(e);
            SyncView = e.message || `${e}` || 'error';
          }
          update(SyncView);
        },
        {immediate: true}
      );

      onBeforeUnmount(() => {
        active = false;
      });

      return () => {
        const View = viewRef.value;
        if (typeof View === 'string') {
          return h(OnError, {message: View});
        } else if (View === OnLoading) {
          return h(OnLoading);
        } else {
          return h(View, props, context.slots);
        }
      };
    },
  }) as any;

  return component;
};
