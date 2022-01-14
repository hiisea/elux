import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
var _excluded = ["forwardedRef", "deps", "store"];
import React, { Component, useContext } from 'react';
import { env, loadComponet, isPromise } from '@elux/core';
import { EluxContextComponent, reactComponentsConfig } from './base';
import { jsx as _jsx } from "react/jsx-runtime";

var loadComponent = function loadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.OnLoading || reactComponentsConfig.LoadComponentOnLoading;
  var OnError = options.OnError || reactComponentsConfig.LoadComponentOnError;

  var Loader = function (_Component) {
    _inheritsLoose(Loader, _Component);

    function Loader(props) {
      var _this;

      _this = _Component.call(this, props) || this;

      _defineProperty(_assertThisInitialized(_this), "active", true);

      _defineProperty(_assertThisInitialized(_this), "loading", false);

      _defineProperty(_assertThisInitialized(_this), "error", '');

      _defineProperty(_assertThisInitialized(_this), "view", void 0);

      _defineProperty(_assertThisInitialized(_this), "state", {
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
          result = loadComponet(moduleName, componentName, store, deps);
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
      var _this$props2 = this.props,
          forwardedRef = _this$props2.forwardedRef,
          deps = _this$props2.deps,
          store = _this$props2.store,
          rest = _objectWithoutPropertiesLoose(_this$props2, _excluded);

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
    var _useContext = useContext(EluxContextComponent),
        _useContext$deps = _useContext.deps,
        deps = _useContext$deps === void 0 ? {} : _useContext$deps;

    var store = reactComponentsConfig.useStore();
    return _jsx(Loader, _extends({}, props, {
      store: store,
      deps: deps,
      forwardedRef: ref
    }));
  });
};

export default loadComponent;