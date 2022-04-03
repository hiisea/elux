"use strict";

exports.__esModule = true;
exports.EluxStoreContextKey = exports.EluxContextKey = void 0;
exports.UseRouter = UseRouter;
exports.UseStore = UseStore;

var _vue = require("vue");

var EluxContextKey = '__EluxContext__';
exports.EluxContextKey = EluxContextKey;
var EluxStoreContextKey = '__EluxStoreContext__';
exports.EluxStoreContextKey = EluxStoreContextKey;

function UseRouter() {
  var _inject = (0, _vue.inject)(EluxContextKey, {}),
      router = _inject.router;

  return router;
}

function UseStore() {
  var _inject2 = (0, _vue.inject)(EluxStoreContextKey, {}),
      store = _inject2.store;

  return store;
}