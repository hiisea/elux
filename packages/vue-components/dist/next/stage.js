import { createVNode as _createVNode } from "vue";
import { h, provide, inject, defineComponent, shallowRef, ref, onBeforeUnmount } from 'vue';
import { env } from '@elux/core';
import { EluxContextKey, EluxStoreContextKey } from './base';
let StageView;
export const Page = defineComponent({
  props: {
    store: {
      type: Object,
      required: true
    },
    view: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const {
      store,
      view
    } = props;
    const storeContext = {
      store: store
    };
    provide(EluxStoreContextKey, storeContext);
    return () => h(view, null);
  }

});
export const Router = defineComponent({
  setup() {
    const {
      router
    } = inject(EluxContextKey, {
      documentHead: ''
    });
    const data = shallowRef({
      classname: 'elux-app',
      pages: router.getCurrentPages().reverse()
    });
    const containerRef = ref({
      className: ''
    });
    const removeListener = router.addListener('change', ({
      routeState,
      root
    }) => {
      if (root) {
        const pages = router.getCurrentPages().reverse();
        let completeCallback;

        if (routeState.action === 'PUSH') {
          const completePromise = new Promise(resolve => {
            completeCallback = resolve;
          });
          data.value = {
            classname: 'elux-app elux-animation elux-change ' + Date.now(),
            pages
          };
          env.setTimeout(() => {
            containerRef.value.className = 'elux-app elux-animation';
          }, 100);
          env.setTimeout(() => {
            containerRef.value.className = 'elux-app';
            completeCallback();
          }, 400);
          return completePromise;
        } else if (routeState.action === 'BACK') {
          const completePromise = new Promise(resolve => {
            completeCallback = resolve;
          });
          data.value = {
            classname: 'elux-app ' + Date.now(),
            pages: [...pages, data.value.pages[data.value.pages.length - 1]]
          };
          env.setTimeout(() => {
            containerRef.value.className = 'elux-app elux-animation elux-change';
          }, 100);
          env.setTimeout(() => {
            data.value = {
              classname: 'elux-app ' + Date.now(),
              pages
            };
            completeCallback();
          }, 400);
          return completePromise;
        } else if (routeState.action === 'RELAUNCH') {
          data.value = {
            classname: 'elux-app ' + Date.now(),
            pages
          };
        }
      }

      return;
    });
    onBeforeUnmount(() => {
      removeListener();
    });
    return () => {
      const {
        classname,
        pages
      } = data.value;
      return _createVNode("div", {
        "ref": containerRef,
        "class": classname
      }, [pages.map(item => {
        const {
          store,
          pagename
        } = item;
        return _createVNode("div", {
          "key": store.id,
          "class": "elux-page",
          "data-pagename": pagename
        }, [_createVNode(Page, {
          "store": store,
          "view": item.page || StageView
        }, null)]);
      })]);
    };
  }

});
export function renderToMP(eluxContext, app) {
  app.provide(EluxContextKey, eluxContext);

  if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }
}
export function renderToDocument(id, APPView, eluxContext, fromSSR, app) {
  StageView = APPView;
  app.provide(EluxContextKey, eluxContext);

  if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }

  app.mount(`#${id}`);
}
export function renderToString(id, APPView, eluxContext, app) {
  StageView = APPView;
  app.provide(EluxContextKey, eluxContext);

  const htmlPromise = require('@vue/server-renderer').renderToString(app);

  return htmlPromise;
}