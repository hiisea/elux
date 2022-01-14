"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.setReactComponentsConfig = exports.reactComponentsConfig = exports.EluxContextComponent = void 0;

var _react = _interopRequireDefault(require("react"));

var _core = require("@elux/core");

var _jsxRuntime = require("react/jsx-runtime");

var reactComponentsConfig = {
  setPageTitle: function setPageTitle(title) {
    return _core.env.document.title = title;
  },
  Provider: null,
  useStore: null,
  LoadComponentOnError: function LoadComponentOnError(_ref) {
    var message = _ref.message;
    return (0, _jsxRuntime.jsx)("div", {
      className: "g-component-error",
      children: message
    });
  },
  LoadComponentOnLoading: function LoadComponentOnLoading() {
    return (0, _jsxRuntime.jsx)("div", {
      className: "g-component-loading",
      children: "loading..."
    });
  }
};
exports.reactComponentsConfig = reactComponentsConfig;
var setReactComponentsConfig = (0, _core.buildConfigSetter)(reactComponentsConfig);
exports.setReactComponentsConfig = setReactComponentsConfig;

var EluxContextComponent = _react.default.createContext({
  documentHead: ''
});

exports.EluxContextComponent = EluxContextComponent;