"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;

exports.__esModule = true;
exports.LoadComponentOnLoading = exports.LoadComponentOnError = exports.LoadComponent = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _jsxRuntime = require("react/jsx-runtime");

var _excluded = ["forwardedRef", "store"];

var LoadComponentOnError = function LoadComponentOnError(_ref) {
  var message = _ref.message;
  return (0, _jsxRuntime.jsx)("div", {
    className: "g-component-error",
    children: message
  });
};

exports.LoadComponentOnError = LoadComponentOnError;

var LoadComponentOnLoading = function LoadComponentOnLoading() {
  return (0, _jsxRuntime.jsx)("div", {
    className: "g-component-loading",
    children: "loading..."
  });
};

exports.LoadComponentOnLoading = LoadComponentOnLoading;

var LoadComponent = function LoadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.onLoading || _core.coreConfig.LoadComponentOnLoading;
  var OnError = options.onError || _core.coreConfig.LoadComponentOnError;

  var Loader = function (_Component) {
    (0, _inheritsLoose2.default)(Loader, _Component);

    function Loader(props) {
      var _this;

      _this = _Component.call(this, props) || this;
      _this.active = true;
      _this.loading = false;
      _this.error = '';
      _this.view = void 0;
      _this.state = {
        ver: 0
      };

      _this.execute();

      return _this;
    }

    var _proto = Loader.prototype;

    _proto.componentWillUnmount = function componentWillUnmount() {
      this.active = false;
    };

    _proto.shouldComponentUpdate = function shouldComponentUpdate() {
      this.execute();
      return true;
    };

    _proto.componentDidMount = function componentDidMount() {
      this.error = '';
    };

    _proto.execute = function execute() {
      var _this2 = this;

      if (!this.view && !this.loading && !this.error) {
        var store = this.props.store;
        this.loading = true;
        var result;

        try {
          result = (0, _core.injectComponent)(moduleName, componentName, store);

          if (_core.env.isServer && (0, _core.isPromise)(result)) {
            result = undefined;
            throw 'can not use async component in SSR';
          }
        } catch (e) {
          this.loading = false;
          this.error = e.message || "" + e;
        }

        if (result) {
          if ((0, _core.isPromise)(result)) {
            result.then(function (view) {
              if (view) {
                _this2.loading = false;
                _this2.view = view;
                _this2.active && _this2.setState({
                  ver: _this2.state.ver + 1
                });
              }
            }, function (e) {
              _core.env.console.error(e);

              _this2.loading = false;
              _this2.error = e.message || "" + e || 'error';
              _this2.active && _this2.setState({
                ver: _this2.state.ver + 1
              });
            });
          } else {
            this.loading = false;
            this.view = result;
          }
        }
      }
    };

    _proto.render = function render() {
      var _this$props = this.props,
          forwardedRef = _this$props.forwardedRef,
          store = _this$props.store,
          rest = (0, _objectWithoutPropertiesLoose2.default)(_this$props, _excluded);

      if (this.view) {
        var View = this.view;
        return (0, _jsxRuntime.jsx)(View, (0, _extends2.default)({
          ref: forwardedRef
        }, rest));
      }

      if (this.loading) {
        var Loading = OnLoading;
        return (0, _jsxRuntime.jsx)(Loading, {});
      }

      return (0, _jsxRuntime.jsx)(OnError, {
        message: this.error
      });
    };

    return Loader;
  }(_react.Component);

  return _react.default.forwardRef(function (props, ref) {
    var store = _core.coreConfig.UseStore();

    return (0, _jsxRuntime.jsx)(Loader, (0, _extends2.default)({}, props, {
      store: store,
      forwardedRef: ref
    }));
  });
};

exports.LoadComponent = LoadComponent;