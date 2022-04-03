/* eslint-disable vue/one-component-per-file */
import {h, provide, defineComponent, shallowRef, ref, onBeforeUnmount, PropType} from 'vue';
import {env, coreConfig, getEntryComponent, EluxComponent, CoreRouter, IStore, EluxStoreContext} from '@elux/core';
import {EluxStoreContextKey} from './base';

export const RouterComponent = defineComponent({
  setup() {
    const router = coreConfig.UseRouter!() as CoreRouter;
    const data = shallowRef<{
      classname: string;
      pages: {
        url: string;
        store: IStore;
      }[];
    }>({classname: 'elux-app', pages: router.getWindowPages().reverse()});
    const containerRef = ref<{className: string}>({className: ''});
    const removeListener = router.addListener(({action, windowChanged}) => {
      const pages = router.getWindowPages().reverse();
      return new Promise<void>((completeCallback) => {
        if (windowChanged) {
          if (action === 'push') {
            data.value = {classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(), pages};
            env.setTimeout(() => {
              containerRef.value.className = 'elux-app elux-animation';
            }, 100);
            env.setTimeout(() => {
              containerRef.value.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            data.value = {classname: 'elux-app ' + Date.now(), pages: [...pages, data.value.pages[data.value.pages.length - 1]]};
            env.setTimeout(() => {
              containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(() => {
              data.value = {classname: 'elux-app ' + Date.now(), pages};
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            data.value = {classname: 'elux-app', pages};
            env.setTimeout(completeCallback, 50);
          }
        } else {
          data.value = {classname: 'elux-app', pages};
          env.setTimeout(completeCallback, 50);
        }
      });
    });
    onBeforeUnmount(() => {
      removeListener();
    });
    const appView = getEntryComponent();
    return () => {
      const {classname, pages} = data.value;
      return (
        <div ref={containerRef} class={classname}>
          {pages.map((item) => {
            const {store, url} = item;
            return (
              <div key={store.sid} data-sid={store.sid} class="elux-window" data-url={url}>
                <EWindow store={store} view={appView} />
              </div>
            );
          })}
        </div>
      );
    };
  },
});

export const EWindow = defineComponent({
  props: {
    store: {
      type: Object as PropType<IStore>,
      required: true,
    },
    view: {
      type: Object as PropType<EluxComponent>,
      required: true,
    },
  },
  setup(props) {
    const storeContext: EluxStoreContext = {store: props.store};
    provide(EluxStoreContextKey, storeContext);
    return () => h(props.view, null);
  },
});
