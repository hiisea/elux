"use strict";

exports.__esModule = true;
exports.renderToMP = renderToMP;
exports.renderToDocument = renderToDocument;
exports.renderToString = renderToString;
exports.RootComponent = void 0;

var _vue = require("vue");

var _core = require("@elux/core");

var _base = require("./base");

var StageView;

var RootComponent = function RootComponent(props, context) {
  return (0, _vue.h)(StageView, props, context.slots);
};

exports.RootComponent = RootComponent;

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