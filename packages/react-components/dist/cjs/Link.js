"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _base = require("./base");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var _default = _react.default.forwardRef(function (_ref, ref) {
  var _onClick = _ref.onClick,
      href = _ref.href,
      route = _ref.route,
      root = _ref.root,
      _ref$action = _ref.action,
      action = _ref$action === void 0 ? 'push' : _ref$action,
      props = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["onClick", "href", "route", "root", "action"]);
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);
  var router = eluxContext.router;
  var onClick = (0, _react.useCallback)(function (event) {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router[action](route, root);
  }, [_onClick, action, root, route, router]);
  props['onClick'] = onClick;

  if (href) {
    return _react.default.createElement("a", (0, _extends2.default)({}, props, {
      href: href,
      ref: ref
    }));
  } else {
    return _react.default.createElement("div", (0, _extends2.default)({}, props, {
      ref: ref
    }));
  }
});

exports.default = _default;