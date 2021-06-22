import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import React, { Component } from 'react';
import { getComponet, isPromise, env, config } from '@elux/core';
export var DepsContext = React.createContext({});
DepsContext.displayName = 'EluxComponentLoader';
var loadViewDefaultOptions = {
  LoadViewOnError: function LoadViewOnError(_ref) {
    var message = _ref.message;
    return React.createElement("div", {
      className: "g-view-error"
    }, message);
  },
  LoadViewOnLoading: function LoadViewOnLoading() {
    return React.createElement("div", {
      className: "g-view-loading"
    }, "loading...");
  }
};
export function setLoadViewOptions(_ref2) {
  var LoadViewOnError = _ref2.LoadViewOnError,
      LoadViewOnLoading = _ref2.LoadViewOnLoading;
  LoadViewOnError && (loadViewDefaultOptions.LoadViewOnError = LoadViewOnError);
  LoadViewOnLoading && (loadViewDefaultOptions.LoadViewOnLoading = LoadViewOnLoading);
}
export var loadView = function loadView(moduleName, viewName, options) {
  var _ref3 = options || {},
      OnLoading = _ref3.OnLoading,
      OnError = _ref3.OnError;

  var Loader = function (_Component) {
    _inheritsLoose(Loader, _Component);

    function Loader(props, context) {
      var _this;

      _this = _Component.call(this, props) || this;

      _defineProperty(_assertThisInitialized(_this), "active", true);

      _defineProperty(_assertThisInitialized(_this), "loading", false);

      _defineProperty(_assertThisInitialized(_this), "error", '');

      _defineProperty(_assertThisInitialized(_this), "view", void 0);

      _defineProperty(_assertThisInitialized(_this), "state", {
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
        deps[moduleName + config.CSP + viewName] = true;
        this.loading = true;
        var result;

        try {
          result = getComponet(moduleName, viewName, true);
        } catch (e) {
          this.loading = false;
          this.error = e.message || "" + e;
        }

        if (result) {
          if (isPromise(result)) {
            result.then(function (view) {
              _this2.loading = false;
              _this2.view = view;
              _this2.active && _this2.setState({
                ver: _this2.state.ver + 1
              });
            }, function (e) {
              env.console.error(e);
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
          rest = _objectWithoutPropertiesLoose(_this$props, ["forwardedRef"]);

      if (this.view) {
        return React.createElement(this.view, _extends({
          ref: forwardedRef
        }, rest));
      }

      if (this.loading) {
        var _Comp = OnLoading || loadViewDefaultOptions.LoadViewOnLoading;

        return React.createElement(_Comp, null);
      }

      var Comp = OnError || loadViewDefaultOptions.LoadViewOnError;
      return React.createElement(Comp, {
        message: this.error
      });
    };

    return Loader;
  }(Component);

  _defineProperty(Loader, "contextType", DepsContext);

  return React.forwardRef(function (props, ref) {
    return React.createElement(Loader, _extends({}, props, {
      forwardedRef: ref
    }));
  });
};