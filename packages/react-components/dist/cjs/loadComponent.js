"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _base = require("./base");

var _excluded = ["forwardedRef", "deps", "store"];

var reactLoadComponent = function reactLoadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.OnLoading || _base.reactComponentsConfig.LoadComponentOnLoading;
  var OnError = options.OnError || _base.reactComponentsConfig.LoadComponentOnError;

  var Loader = function (_Component) {
    (0, _inheritsLoose2.default)(Loader, _Component);

    function Loader(props) {
      var _this;

      _this = _Component.call(this, props) || this;
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "active", true);
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "loading", false);
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "error", '');
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "view", void 0);
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "state", {
        ver: 0
      });

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
        var _this$props = this.props,
            deps = _this$props.deps,
            store = _this$props.store;
        this.loading = true;
        var result;

        try {
          result = (0, _core.loadComponent)(moduleName, componentName, store, deps);
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
      var _this$props2 = this.props,
          forwardedRef = _this$props2.forwardedRef,
          deps = _this$props2.deps,
          store = _this$props2.store,
          rest = (0, _objectWithoutPropertiesLoose2.default)(_this$props2, _excluded);

      if (this.view) {
        var View = this.view;
        return _react.default.createElement(View, (0, _extends2.default)({
          ref: forwardedRef
        }, rest));
      }

      if (this.loading) {
        var Loading = OnLoading;
        return _react.default.createElement(Loading, null);
      }

      return _react.default.createElement(OnError, {
        message: this.error
      });
    };

    return Loader;
  }(_react.Component);

  return _react.default.forwardRef(function (props, ref) {
    var _useContext = (0, _react.useContext)(_base.EluxContextComponent),
        _useContext$deps = _useContext.deps,
        deps = _useContext$deps === void 0 ? {} : _useContext$deps;

    var store = _base.reactComponentsConfig.useStore();

    return _react.default.createElement(Loader, (0, _extends2.default)({}, props, {
      store: store,
      deps: deps,
      forwardedRef: ref
    }));
  });
};

var _default = reactLoadComponent;
exports.default = _default;