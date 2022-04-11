import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
var _excluded = ["forwardedRef", "store"];
import React, { Component } from 'react';
import { env, injectComponent, isPromise, coreConfig } from '@elux/core';
import { jsx as _jsx } from "react/jsx-runtime";
export var LoadComponentOnError = function LoadComponentOnError(_ref) {
  var message = _ref.message;
  return _jsx("div", {
    className: "g-component-error",
    children: message
  });
};
export var LoadComponentOnLoading = function LoadComponentOnLoading() {
  return _jsx("div", {
    className: "g-component-loading",
    children: "loading..."
  });
};
export var LoadComponent = function LoadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  var OnError = options.onError || coreConfig.LoadComponentOnError;

  var Loader = function (_Component) {
    _inheritsLoose(Loader, _Component);

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
          result = injectComponent(moduleName, componentName, store);

          if (env.isServer && isPromise(result)) {
            result = undefined;
            throw 'can not use async component in SSR';
          }
        } catch (e) {
          this.loading = false;
          this.error = e.message || "" + e;
        }

        if (result) {
          if (isPromise(result)) {
            result.then(function (view) {
              if (view) {
                _this2.loading = false;
                _this2.view = view;
                _this2.active && _this2.setState({
                  ver: _this2.state.ver + 1
                });
              }
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
          store = _this$props.store,
          rest = _objectWithoutPropertiesLoose(_this$props, _excluded);

      if (this.view) {
        var View = this.view;
        return _jsx(View, _extends({
          ref: forwardedRef
        }, rest));
      }

      if (this.loading) {
        var Loading = OnLoading;
        return _jsx(Loading, {});
      }

      return _jsx(OnError, {
        message: this.error
      });
    };

    return Loader;
  }(Component);

  return React.forwardRef(function (props, ref) {
    var store = coreConfig.UseStore();
    return _jsx(Loader, _extends({}, props, {
      store: store,
      forwardedRef: ref
    }));
  });
};