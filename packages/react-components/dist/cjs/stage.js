"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.renderToMP = renderToMP;
exports.renderToDocument = renderToDocument;
exports.renderToString = renderToString;

var _react = _interopRequireDefault(require("react"));

var _reactDom = require("react-dom");

var _core = require("@elux/core");

var _base = require("./base");

var _Router = require("./Router");

function renderToMP(eluxContext) {
  var Component = function Component(_ref) {
    var children = _ref.children;
    return _react.default.createElement(_base.EluxContextComponent.Provider, {
      value: eluxContext
    }, children);
  };

  return Component;
}

function renderToDocument(id, APPView, eluxContext, fromSSR) {
  var renderFun = fromSSR ? _reactDom.hydrate : _reactDom.render;

  var panel = _core.env.document.getElementById(id);

  renderFun(_react.default.createElement(_base.EluxContextComponent.Provider, {
    value: eluxContext
  }, _react.default.createElement(_Router.Router, {
    page: APPView
  })), panel);
}

function renderToString(id, APPView, eluxContext) {
  var html = require('react-dom/server').renderToString(_react.default.createElement(_base.EluxContextComponent.Provider, {
    value: eluxContext
  }, _react.default.createElement(_Router.Router, {
    page: APPView
  })));

  return Promise.resolve(html);
}