"use strict";

exports.__esModule = true;
exports.EluxStoreContextKey = exports.EluxContextKey = exports.setVueComponentsConfig = exports.vueComponentsConfig = void 0;

var _vue = require("vue");

var _core = require("@elux/core");

var vueComponentsConfig = {
  setPageTitle: function setPageTitle(title) {
    return _core.env.document.title = title;
  },
  Provider: null,
  LoadComponentOnError: function LoadComponentOnError(_ref) {
    var message = _ref.message;
    return (0, _vue.createVNode)("div", {
      "class": "g-component-error"
    }, [message]);
  },
  LoadComponentOnLoading: function LoadComponentOnLoading() {
    return (0, _vue.createVNode)("div", {
      "class": "g-component-loading"
    }, [(0, _vue.createTextVNode)("loading...")]);
  }
};
exports.vueComponentsConfig = vueComponentsConfig;
var setVueComponentsConfig = (0, _core.buildConfigSetter)(vueComponentsConfig);
exports.setVueComponentsConfig = setVueComponentsConfig;
var EluxContextKey = '__EluxContext__';
exports.EluxContextKey = EluxContextKey;
var EluxStoreContextKey = '__EluxStoreContext__';
exports.EluxStoreContextKey = EluxStoreContextKey;