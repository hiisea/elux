"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
var _exportNames = {
  setConfig: true,
  createMP: true,
  routeENV: true
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

var _stage = require("@elux/react-components/stage");

var _routeMp = require("@elux/route-mp");

var _taro2 = require("@elux/taro");

exports.routeENV = _taro2.routeENV;
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

var createMP = function createMP(moduleGetter, middlewares, appModuleName) {
  var tabPages = (0, _taro2.getTabPages)();
  return (0, _app.createBaseMP)({}, function (locationTransform) {
    return (0, _routeMp.createRouter)(locationTransform, _taro2.routeENV, tabPages);
  }, _stage.renderToMP, moduleGetter, middlewares, appModuleName);
};

exports.createMP = createMP;