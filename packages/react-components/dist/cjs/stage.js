"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.renderToDocument = renderToDocument;
exports.renderToMP = renderToMP;
exports.renderToString = renderToString;

var _react = _interopRequireDefault(require("react"));

var _reactDom = require("react-dom");

var _core = require("@elux/core");

var _base = require("./base");

var _Router = require("./Router");

var _jsxRuntime = require("react/jsx-runtime");

function renderToMP(eluxContext) {
  var Component = function Component(_ref) {
    var children = _ref.children;
    return (0, _jsxRuntime.jsx)(_base.EluxContextComponent.Provider, {
      value: eluxContext,
      children: children
    });
  };

  return Component;
}

function renderToDocument(id, APPView, eluxContext, fromSSR) {
  var renderFun = fromSSR ? _reactDom.hydrate : _reactDom.render;

  var panel = _core.env.document.getElementById(id);

  renderFun((0, _jsxRuntime.jsx)(_base.EluxContextComponent.Provider, {
    value: eluxContext,
    children: (0, _jsxRuntime.jsx)(_Router.Router, {
      page: APPView
    })
  }), panel);
}

function renderToString(id, APPView, eluxContext) {
  var html = require('react-dom/server').renderToString((0, _jsxRuntime.jsx)(_base.EluxContextComponent.Provider, {
    value: eluxContext,
    children: (0, _jsxRuntime.jsx)(_Router.Router, {
      page: APPView
    })
  }));

  return Promise.resolve(html);
}