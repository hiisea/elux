"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.setRootViewOptions = setRootViewOptions;
exports.renderToDocument = renderToDocument;
exports.renderToString = renderToString;

var _react = _interopRequireDefault(require("react"));

var _core = require("@elux/core");

var _base = require("./base");

var _reactDom = require("react-dom");

var Provider;

function setRootViewOptions(options) {
  options.Provider !== undefined && (Provider = options.Provider);
}

function renderToDocument(id, APP, store, eluxContext, fromSSR) {
  var renderFun = fromSSR ? _reactDom.hydrate : _reactDom.render;

  var panel = _core.env.document.getElementById(id);

  renderFun(_react.default.createElement(_base.EluxContextComponent.Provider, {
    value: eluxContext
  }, _react.default.createElement(Provider, {
    store: store
  }, _react.default.createElement(APP, null))), panel);
}

function renderToString(id, APP, store, eluxContext) {
  var html = require('react-dom/server').renderToString(_react.default.createElement(_base.EluxContextComponent.Provider, {
    value: eluxContext
  }, _react.default.createElement(Provider, {
    store: store
  }, _react.default.createElement(APP, null))));

  return html;
}