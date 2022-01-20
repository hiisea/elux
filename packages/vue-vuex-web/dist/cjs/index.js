"use strict";

exports.__esModule = true;

var _coreVuex = require("@elux/core-vuex");

Object.keys(_coreVuex).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _coreVuex[key]) return;
  exports[key] = _coreVuex[key];
});

var _vueWeb = require("@elux/vue-web");

Object.keys(_vueWeb).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _vueWeb[key]) return;
  exports[key] = _vueWeb[key];
});