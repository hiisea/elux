"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.setLoadViewOptions = setLoadViewOptions;
exports.loadView = exports.DepsContext = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var DepsContext = _react.default.createContext({});

exports.DepsContext = DepsContext;
DepsContext.displayName = 'EluxComponentLoader';
var loadViewDefaultOptions = {
  LoadViewOnError: function LoadViewOnError(_ref) {
    var message = _ref.message;
    return _react.default.createElement("div", {
      className: "g-view-error"
    }, message);
  },
  LoadViewOnLoading: function LoadViewOnLoading() {
    return _react.default.createElement("div", {
      className: "g-view-loading"
    }, "loading...");
  }
};

function setLoadViewOptions(_ref2) {
  var LoadViewOnError = _ref2.LoadViewOnError,
      LoadViewOnLoading = _ref2.LoadViewOnLoading;
  LoadViewOnError && (loadViewDefaultOptions.LoadViewOnError = LoadViewOnError);
  LoadViewOnLoading && (loadViewDefaultOptions.LoadViewOnLoading = LoadViewOnLoading);
}

var loadView = function loadView(moduleName, viewName, options) {
  var _ref3 = options || {},
      OnLoading = _ref3.OnLoading,
      OnError = _ref3.OnError;

  var Loader = function (_Component) {
    (0, _inheritsLoose2.default)(Loader, _Component);

    function Loader(props, context) {
      var _this;

      _this = _Component.call(this, props) || this;
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "active", true);
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "loading", false);
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "error", '');
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "view", void 0);
      (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "state", {
        ver: 0
      });
      _this.context = context;

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
        var deps = this.context || {};
        deps[moduleName + _core.config.CSP + viewName] = true;
        this.loading = true;
        var result;

        try {
          result = (0, _core.getComponet)(moduleName, viewName, true);
        } catch (e) {
          this.loading = false;
          this.error = e.message || "" + e;
        }

        if (result) {
          if ((0, _core.isPromise)(result)) {
            result.then(function (view) {
              _this2.loading = false;
              _this2.view = view;
              _this2.active && _this2.setState({
                ver: _this2.state.ver + 1
              });
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
          rest = (0, _objectWithoutPropertiesLoose2.default)(_this$props, ["forwardedRef"]);

      if (this.view) {
        return _react.default.createElement(this.view, (0, _extends2.default)({
          ref: forwardedRef
        }, rest));
      }

      if (this.loading) {
        var _Comp = OnLoading || loadViewDefaultOptions.LoadViewOnLoading;

        return _react.default.createElement(_Comp, null);
      }

      var Comp = OnError || loadViewDefaultOptions.LoadViewOnError;
      return _react.default.createElement(Comp, {
        message: this.error
      });
    };

    return Loader;
  }(_react.Component);

  (0, _defineProperty2.default)(Loader, "contextType", DepsContext);
  return _react.default.forwardRef(function (props, ref) {
    return _react.default.createElement(Loader, (0, _extends2.default)({}, props, {
      forwardedRef: ref
    }));
  });
};

exports.loadView = loadView;