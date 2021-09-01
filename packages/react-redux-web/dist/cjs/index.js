"use strict";

exports.__esModule = true;

var _reactComponents = require("@elux/react-components");

var _reactRedux = require("@elux/react-redux");

Object.keys(_reactRedux).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _reactRedux[key]) return;
  exports[key] = _reactRedux[key];
});

var _app = require("@elux/app");

var _reactWeb = require("@elux/react-web");

Object.keys(_reactWeb).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _reactWeb[key]) return;
  exports[key] = _reactWeb[key];
});
(0, _app.setAppConfig)({
  useStore: _reactRedux.useStore
});
(0, _reactComponents.setReactComponentsConfig)({
  Provider: _reactRedux.Provider,
  useStore: _reactRedux.useStore
});