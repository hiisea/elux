"use strict";

exports.__esModule = true;
exports.renderToMP = renderToMP;
exports.renderToDocument = renderToDocument;
exports.renderToString = renderToString;
exports.Page = exports.Router = void 0;

var _vue = require("vue");

var _core = require("@elux/core");

var _base = require("./base");

var StageView;

var Router = function Router(props, context) {
  return (0, _vue.h)(Page, props, context.slots);
};

exports.Router = Router;
var Page = {
  setup: function setup(props, context) {
    var _inject = (0, _vue.inject)(_base.EluxContextKey, {
      documentHead: ''
    }),
        router = _inject.router;

    var store = router.getCurrentStore();
    var storeContext = {
      store: store
    };
    (0, _vue.provide)(_base.EluxStoreContextKey, storeContext);
    return function () {
      return (0, _vue.h)(StageView, props, context.slots);
    };
  }
};
exports.Page = Page;

function renderToMP(store, eluxContext, app) {
  app.use(store);
  app.provide(_base.EluxContextKey, eluxContext);

  if (process.env.NODE_ENV === 'development' && _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }
}

function renderToDocument(id, APPView, store, eluxContext, fromSSR, app) {
  StageView = APPView;
  app.use(store);
  app.provide(_base.EluxContextKey, eluxContext);

  if (process.env.NODE_ENV === 'development' && _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }

  app.mount("#" + id);
}

function renderToString(id, APPView, store, eluxContext, app) {
  StageView = APPView;
  app.use(store);
  app.provide(_base.EluxContextKey, eluxContext);

  var htmlPromise = require('@vue/server-renderer').renderToString(app);

  return htmlPromise;
}