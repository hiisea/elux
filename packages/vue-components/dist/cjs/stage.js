"use strict";

exports.__esModule = true;
exports.renderToMP = renderToMP;
exports.renderToDocument = renderToDocument;
exports.renderToString = renderToString;
exports.Router = exports.Page = void 0;

var _vue = require("vue");

var _core = require("@elux/core");

var _base = require("./base");

var StageView;
var Page = (0, _vue.defineComponent)({
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
    var store = props.store,
        view = props.view;
    var storeContext = {
      store: store
    };
    (0, _vue.provide)(_base.EluxStoreContextKey, storeContext);
    return function () {
      return (0, _vue.h)(view, null);
    };
  }
});
exports.Page = Page;
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
            classname: 'elux-app elux-animation elux-change ' + Date.now(),
            pages: pages
          };

          _core.env.setTimeout(function () {
            containerRef.value.className = 'elux-app elux-animation';
          }, 200);

          _core.env.setTimeout(function () {
            containerRef.value.className = 'elux-app';
            completeCallback();
          }, 500);

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
            containerRef.value.className = 'elux-app elux-animation elux-change';
          }, 200);

          _core.env.setTimeout(function () {
            data.value = {
              classname: 'elux-app ' + Date.now(),
              pages: pages
            };
            completeCallback();
          }, 500);

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
    (0, _vue.onBeforeMount)(function () {
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
          "key": store.id,
          "class": "elux-page",
          "data-pagename": pagename
        }, [(0, _vue.createVNode)(Page, {
          "store": store,
          "view": item.page || StageView
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

function renderToDocument(id, APPView, eluxContext, fromSSR, app) {
  StageView = APPView;
  app.provide(_base.EluxContextKey, eluxContext);

  if (process.env.NODE_ENV === 'development' && _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }

  app.mount("#" + id);
}

function renderToString(id, APPView, eluxContext, app) {
  StageView = APPView;
  app.provide(_base.EluxContextKey, eluxContext);

  var htmlPromise = require('@vue/server-renderer').renderToString(app);

  return htmlPromise;
}