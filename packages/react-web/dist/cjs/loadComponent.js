"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.setLoadComponentOptions = setLoadComponentOptions;
exports.loadComponent = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _env = _interopRequireDefault(require("./env"));

var _sington = require("./sington");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var loadComponentDefaultOptions = {
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

function setLoadComponentOptions(_ref2) {
  var LoadComponentOnError = _ref2.LoadComponentOnError,
      LoadComponentOnLoading = _ref2.LoadComponentOnLoading;
  LoadComponentOnError && (loadComponentDefaultOptions.LoadComponentOnError = LoadComponentOnError);
  LoadComponentOnLoading && (loadComponentDefaultOptions.LoadComponentOnLoading = LoadComponentOnLoading);
}

var loadComponent = function loadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.OnLoading || loadComponentDefaultOptions.LoadComponentOnLoading;
  var OnError = options.OnError || loadComponentDefaultOptions.LoadComponentOnError;

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
        var _ref3 = this.context || {},
            deps = _ref3.deps,
            store = _ref3.store;

        this.loading = true;
        var result;

        try {
          result = (0, _core.loadComponet)(moduleName, componentName, store, deps || {});
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
              _env.default.console.error(e);

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

  (0, _defineProperty2.default)(Loader, "contextType", _sington.EluxContext);
  return _react.default.forwardRef(function (props, ref) {
    return _react.default.createElement(Loader, (0, _extends2.default)({}, props, {
      forwardedRef: ref
    }));
  });
};

exports.loadComponent = loadComponent;