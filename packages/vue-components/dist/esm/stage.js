import { createVNode as _createVNode } from "vue";
import { h, provide, inject, defineComponent, shallowRef, ref, onBeforeUnmount } from 'vue';
import { env } from '@elux/core';
import { EluxContextKey, EluxStoreContextKey } from './base';
var StageView;
export var EWindow = defineComponent({
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
  setup: function setup(props) {
    var storeContext = {
      store: props.store
    };
    provide(EluxStoreContextKey, storeContext);
    return function () {
      return h(props.view, null);
    };
  }
});
export var Router = defineComponent({
  setup: function setup() {
    var _inject = inject(EluxContextKey, {
      documentHead: ''
    }),
        router = _inject.router;

    var data = shallowRef({
      classname: 'elux-app',
      pages: router.getCurrentPages().reverse()
    });
    var containerRef = ref({
      className: ''
    });
    var removeListener = router.addListener('change', function (_ref) {
      var routeState = _ref.routeState,
          root = _ref.root;

      if (root) {
        var pages = router.getCurrentPages().reverse();
        var completeCallback;

        if (routeState.action === 'PUSH') {
          var completePromise = new Promise(function (resolve) {
            completeCallback = resolve;
          });
          data.value = {
            classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
            pages: pages
          };
          env.setTimeout(function () {
            containerRef.value.className = 'elux-app elux-animation';
          }, 100);
          env.setTimeout(function () {
            containerRef.value.className = 'elux-app';
            completeCallback();
          }, 400);
          return completePromise;
        } else if (routeState.action === 'BACK') {
          var _completePromise = new Promise(function (resolve) {
            completeCallback = resolve;
          });

          data.value = {
            classname: 'elux-app ' + Date.now(),
            pages: [].concat(pages, [data.value.pages[data.value.pages.length - 1]])
          };
          env.setTimeout(function () {
            containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
          }, 100);
          env.setTimeout(function () {
            data.value = {
              classname: 'elux-app ' + Date.now(),
              pages: pages
            };
            completeCallback();
          }, 400);
          return _completePromise;
        } else if (routeState.action === 'RELAUNCH') {
          data.value = {
            classname: 'elux-app ' + Date.now(),
            pages: pages
          };
        }
      }

      return;
    });
    onBeforeUnmount(function () {
      removeListener();
    });
    return function () {
      var _data$value = data.value,
          classname = _data$value.classname,
          pages = _data$value.pages;
      return _createVNode("div", {
        "ref": containerRef,
        "class": classname
      }, [pages.map(function (item) {
        var store = item.store,
            pagename = item.pagename;
        return _createVNode("div", {
          "key": store.sid,
          "data-sid": store.sid,
          "class": "elux-window",
          "data-pagename": pagename
        }, [_createVNode(EWindow, {
          "store": store,
          "view": item.pageComponent || StageView
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
export function renderToDocument(id, APPView, eluxContext, fromSSR, app, store) {
  StageView = APPView;
  app.provide(EluxContextKey, eluxContext);

  if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }

  app.mount("#" + id);
}
export function renderToString(id, APPView, eluxContext, app, store) {
  StageView = APPView;
  app.provide(EluxContextKey, eluxContext);

  var htmlPromise = require('@vue/server-renderer').renderToString(app);

  return htmlPromise;
}