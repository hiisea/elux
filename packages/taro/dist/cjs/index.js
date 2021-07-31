"use strict";

exports.__esModule = true;
exports.createMP = void 0;

var _core = require("@elux/core");

var _stage = require("@elux/react-components/stage");

var _app = require("@elux/app");

var _routeMp = require("@elux/route-mp");

var _patch = require("./patch");

var createMP = function createMP(moduleGetter, middlewares, appModuleName) {
  if (_core.env.__taroAppConfig.tabBar) {
    _core.env.__taroAppConfig.tabBar.list.forEach(function (_ref) {
      var pagePath = _ref.pagePath;
      _patch.tabPages["/" + pagePath.replace(/^\/+|\/+$/g, '')] = true;
    });
  }

  return (0, _app.createBaseMP)({}, function (locationTransform) {
    return (0, _routeMp.createRouter)(locationTransform, _patch.routeENV, _patch.tabPages);
  }, _stage.renderToMP, moduleGetter, middlewares, appModuleName);
};

exports.createMP = createMP;