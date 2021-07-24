"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.EluxContextComponent = exports.setReactComponentsConfig = exports.reactComponentsConfig = void 0;

var _react = _interopRequireDefault(require("react"));

var _core = require("@elux/core");

var reactComponentsConfig = {
  setPageTitle: function setPageTitle(title) {
    return _core.env.document.title = title;
  },
  Provider: null,
  LoadComponentOnError: function LoadComponentOnError(_ref) {
    var message = _ref.message;
    return _react.default.createElement("div", {
      className: "g-component-error"
    }, message);
  },
  LoadComponentOnLoading: function LoadComponentOnLoading() {
    return _react.default.createElement("div", {
      className: "g-component-loading"
    }, "loading...");
  }
};
exports.reactComponentsConfig = reactComponentsConfig;
var setReactComponentsConfig = (0, _core.buildConfigSetter)(reactComponentsConfig);
exports.setReactComponentsConfig = setReactComponentsConfig;

var EluxContextComponent = _react.default.createContext({
  documentHead: ''
});

exports.EluxContextComponent = EluxContextComponent;