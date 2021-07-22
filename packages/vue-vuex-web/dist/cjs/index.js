"use strict";

exports.__esModule = true;
var _exportNames = {
  createVuex: true,
  useStore: true,
  createLogger: true
};
exports.createLogger = exports.useStore = exports.createVuex = void 0;

var _vueWeb = require("@elux/vue-web");

Object.keys(_vueWeb).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _vueWeb[key]) return;
  exports[key] = _vueWeb[key];
});

var _coreVuex = require("@elux/core-vuex");

exports.createVuex = _coreVuex.createVuex;

var _vuex = require("vuex");

exports.useStore = _vuex.useStore;
exports.createLogger = _vuex.createLogger;