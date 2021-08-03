"use strict";

exports.__esModule = true;

var _reactTaro = require("@elux/react-taro");

Object.keys(_reactTaro).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _reactTaro[key]) return;
  exports[key] = _reactTaro[key];
});

var _reactRedux = require("@elux/react-redux");

Object.keys(_reactRedux).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _reactRedux[key]) return;
  exports[key] = _reactRedux[key];
});
(0, _reactTaro.setReactComponentsConfig)({
  Provider: _reactRedux.Provider,
  useStore: _reactRedux.useStore
});