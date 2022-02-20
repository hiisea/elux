"use strict";

exports.__esModule = true;
exports.Router = exports.EWindow = void 0;
exports.renderToDocument = renderToDocument;
exports.renderToMP = renderToMP;
exports.renderToString = renderToString;

var _vue = require("vue");

var _core = require("@elux/core");

var _base = require("./base");

var StageView;
var EWindow = (0, _vue.defineComponent)({
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
    (0, _vue.provide)(_base.EluxStoreContextKey, storeContext);
    return function () {
      return (0, _vue.h)(props.view, null);
    };
  }
});
exports.EWindow = EWindow;
var Router = (0, _vue.defineComponent)({
  setup: function setup() {
    var _inject = (0, _vue.inject)(_base.EluxContextKey, {
      documentHead: ''
    }),
        router = _inject.router;

    var data = (0, _vue.shallowRef)({
      classname: 'elux-app',
      pages: router.getCurrentPages().reverse()
    });
    var containerRef = (0, _vue.ref)({
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

          _core.env.setTimeout(function () {
            containerRef.value.className = 'elux-app elux-animation';
          }, 100);

          _core.env.setTimeout(function () {
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

          _core.env.setTimeout(function () {
            containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
          }, 100);

          _core.env.setTimeout(function () {
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
    (0, _vue.onBeforeUnmount)(function () {
      removeListener();
    });
    return function () {
      var _data$value = data.value,
          classname = _data$value.classname,
          pages = _data$value.pages;
      return (0, _vue.createVNode)("div", {
        "ref": containerRef,
        "class": classname
      }, [pages.map(function (item) {
        var store = item.store,
            pagename = item.pagename;
        return (0, _vue.createVNode)("div", {
          "key": store.sid,
          "data-sid": store.sid,
          "class": "elux-window",
          "data-pagename": pagename
        }, [(0, _vue.createVNode)(EWindow, {
          "store": store,
          "view": item.pageComponent || StageView
        }, null)]);
      })]);
    };
  }
});
exports.Router = Router;

function renderToMP(eluxContext, app) {
  app.provide(_base.EluxContextKey, eluxContext);

  if (process.env.NODE_ENV === 'development' && _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }
}

function renderToDocument(id, APPView, eluxContext, fromSSR, app, store) {
  StageView = APPView;
  app.provide(_base.EluxContextKey, eluxContext);

  if (process.env.NODE_ENV === 'development' && _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }

  app.mount("#" + id);
}

function renderToString(id, APPView, eluxContext, app, store) {
  StageView = APPView;
  app.provide(_base.EluxContextKey, eluxContext);

  var htmlPromise = require('@vue/server-renderer').renderToString(app);

  return htmlPromise;
}