"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
var _exportNames = {
  setConfig: true,
  createMP: true
};
exports.setConfig = setConfig;
exports.createMP = void 0;

var _taro = _interopRequireDefault(require("@tarojs/taro"));

var _vueComponents = require("@elux/vue-components");

Object.keys(_vueComponents).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _vueComponents[key]) return;
  exports[key] = _vueComponents[key];
});

var _app = require("@elux/app");

Object.keys(_app).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _app[key]) return;
  exports[key] = _app[key];
});

var _taro2 = require("@elux/taro");

var _stage = require("@elux/vue-components/stage");

var _routeMp = require("@elux/route-mp");

(0, _app.setAppConfig)({
  loadComponent: _vueComponents.loadComponent
});

function setConfig(conf) {
  (0, _vueComponents.setVueComponentsConfig)(conf);
  (0, _app.setUserConfig)(conf);
}

(0, _vueComponents.setVueComponentsConfig)({
  setPageTitle: function setPageTitle(title) {
    return _taro.default.setNavigationBarTitle({
      title: title
    });
  }
});

var createMP = function createMP(app, moduleGetter, middlewares, appModuleName) {
  var tabPages = (0, _taro2.getTabPages)();
  return (0, _app.createBaseMP)(app, function (locationTransform) {
    return (0, _routeMp.createRouter)(locationTransform, _taro2.routeENV, tabPages);
  }, _stage.renderToMP, moduleGetter, middlewares, appModuleName);
};

exports.createMP = createMP;