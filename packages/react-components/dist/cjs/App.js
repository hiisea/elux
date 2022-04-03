"use strict";

exports.__esModule = true;
exports.default = void 0;

var _reactDom = require("react-dom");

var _core = require("@elux/core");

var _server = require("@elux/react-components/server");

var _base = require("./base");

var _Router = require("./Router");

var _jsxRuntime = require("react/jsx-runtime");

var AppRender = {
  toDocument: function toDocument(id, eluxContext, fromSSR, app, store) {
    var renderFun = fromSSR ? _reactDom.hydrate : _reactDom.render;

    var panel = _core.env.document.getElementById(id);

    var appView = (0, _core.getEntryComponent)();
    renderFun((0, _jsxRuntime.jsx)(_base.EluxContextComponent.Provider, {
      value: eluxContext,
      children: (0, _jsxRuntime.jsx)(_Router.RouterComponent, {
        page: appView
      })
    }), panel);
  },
  toString: function toString(id, eluxContext, app, store) {
    var appView = (0, _core.getEntryComponent)();
    var html = (0, _server.renderToString)((0, _jsxRuntime.jsx)(_base.EluxContextComponent.Provider, {
      value: eluxContext,
      children: (0, _jsxRuntime.jsx)(_Router.RouterComponent, {
        page: appView
      })
    }));
    return Promise.resolve(html);
  }
};
var _default = AppRender;
exports.default = _default;