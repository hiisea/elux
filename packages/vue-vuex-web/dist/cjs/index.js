"use strict";

exports.__esModule = true;
var _exportNames = {
  createLogger: true
};
exports.createLogger = void 0;

var _vuex = require("vuex");

exports.createLogger = _vuex.createLogger;

var _coreVuex = require("@elux/core-vuex");

Object.keys(_coreVuex).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _coreVuex[key]) return;
  exports[key] = _coreVuex[key];
});

var _vueWeb = require("@elux/vue-web");

Object.keys(_vueWeb).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _vueWeb[key]) return;
  exports[key] = _vueWeb[key];
});