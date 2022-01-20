/* eslint-disable vue/one-component-per-file */
import {h, provide, inject, defineComponent, DefineComponent, shallowRef, ref, onBeforeUnmount, PropType} from 'vue';
import type {App} from 'vue';
import {env, IStore} from '@elux/core';
import {EluxContext, EluxContextKey, EluxStoreContextKey, EluxStoreContext} from './base';

let StageView: DefineComponent;

export const Page = defineComponent({
  props: {
    store: {
      type: Object as PropType<IStore>,
      required: true,
    },
    view: {
      type: Object as PropType<DefineComponent>,
      required: true,
    },
  },
  setup(props) {
    const storeContext: EluxStoreContext = {store: props.store!};
    provide(EluxStoreContextKey, storeContext);
    return () => h(props.view, null);
  },
});

export const Router = defineComponent({
  setup() {
    const {router} = inject<EluxContext>(EluxContextKey, {documentHead: ''});
    const data = shallowRef<{
      classname: string;
      pages: {
        pagename: string;
        store: IStore<any>;
        page?: any;
      }[];
    }>({
      classname: 'elux-app',
      pages: router!.getCurrentPages().reverse(),
    });
    const containerRef = ref<{className: string}>({className: ''});
    const removeListener = router!.addListener('change', ({routeState, root}) => {
      if (root) {
        const pages = router!.getCurrentPages().reverse();
        let completeCallback: () => void;
        if (routeState.action === 'PUSH') {
          const completePromise = new Promise<void>((resolve) => {
            completeCallback = resolve;
          });
          data.value = {classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(), pages};
          env.setTimeout(() => {
            containerRef.value.className = 'elux-app elux-animation';
          }, 100);
          env.setTimeout(() => {
            containerRef.value.className = 'elux-app';
            completeCallback();
          }, 400);
          return completePromise;
        } else if (routeState.action === 'BACK') {
          const completePromise = new Promise<void>((resolve) => {
            completeCallback = resolve;
          });
          data.value = {classname: 'elux-app ' + Date.now(), pages: [...pages, data.value.pages[data.value.pages.length - 1]]};
          env.setTimeout(() => {
            containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
          }, 100);
          env.setTimeout(() => {
            data.value = {classname: 'elux-app ' + Date.now(), pages};
            completeCallback();
          }, 400);
          return completePromise;
        } else if (routeState.action === 'RELAUNCH') {
          data.value = {classname: 'elux-app ' + Date.now(), pages};
        }
      }
      return;
    });
    onBeforeUnmount(() => {
      removeListener();
    });
    return () => {
      const {classname, pages} = data.value;
      return (
        <div ref={containerRef} class={classname}>
          {pages.map((item) => {
            const {store, pagename} = item;
            return (
              <div key={store.sid} data-sid={store.sid} class="elux-page" data-pagename={pagename}>
                <Page store={store} view={item.page || StageView} />
              </div>
            );
          })}
        </div>
      );
    };
  },
});

export function renderToMP(eluxContext: EluxContext, app: App): void {
  app.provide<EluxContext>(EluxContextKey, eluxContext);
  if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }
}
export function renderToDocument(
  id: string,
  APPView: DefineComponent<{}>,
  eluxContext: EluxContext,
  fromSSR: boolean,
  app: App,
  store: IStore
): void {
  StageView = APPView;
  app.provide<EluxContext>(EluxContextKey, eluxContext);
  if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }
  app.mount(`#${id}`);
}
export function renderToString(id: string, APPView: DefineComponent<{}>, eluxContext: EluxContext, app: App, store: IStore): Promise<string> {
  StageView = APPView;
  app.provide<EluxContext>(EluxContextKey, eluxContext);
  const htmlPromise: Promise<string> = require('@vue/server-renderer').renderToString(app);
  return htmlPromise;
}
