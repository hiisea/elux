"use strict";

exports.__esModule = true;
var _exportNames = {
  useStore: true,
  createLogger: true
};
exports.createLogger = exports.useStore = void 0;

var _vuex = require("vuex");

exports.useStore = _vuex.useStore;
exports.createLogger = _vuex.createLogger;

var _coreVuex = require("@elux/core-vuex");

Object.keys(_coreVuex).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _coreVuex[key]) return;
  exports[key] = _coreVuex[key];
});

var _vueTaro = require("@elux/vue-taro");

Object.keys(_vueTaro).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _vueTaro[key]) return;
  exports[key] = _vueTaro[key];
});