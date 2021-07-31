"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
var _exportNames = {
  createMP: true,
  setConfig: true
};
exports.setConfig = setConfig;
exports.createMP = void 0;

var _taro = _interopRequireDefault(require("@tarojs/taro"));

var _reactComponents = require("@elux/react-components");

Object.keys(_reactComponents).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactComponents[key]) return;
  exports[key] = _reactComponents[key];
});

var _app = require("@elux/app");

Object.keys(_app).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _app[key]) return;
  exports[key] = _app[key];
});

var _taro2 = require("@elux/taro");

exports.createMP = _taro2.createMP;
(0, _app.setAppConfig)({
  loadComponent: _reactComponents.loadComponent
});

function setConfig(conf) {
  (0, _reactComponents.setReactComponentsConfig)(conf);
  (0, _app.setUserConfig)(conf);
}

(0, _reactComponents.setReactComponentsConfig)({
  setPageTitle: function setPageTitle(title) {
    return _taro.default.setNavigationBarTitle({
      title: title
    });
  }
});