"use strict";

exports.__esModule = true;
exports.LoadComponentOnLoading = exports.LoadComponentOnError = exports.LoadComponent = void 0;

var _vue = require("vue");

var _core = require("@elux/core");

var LoadComponentOnError = function LoadComponentOnError(_ref) {
  var message = _ref.message;
  return (0, _vue.createVNode)("div", {
    "class": "g-component-error"
  }, [message]);
};

exports.LoadComponentOnError = LoadComponentOnError;

var LoadComponentOnLoading = function LoadComponentOnLoading() {
  return (0, _vue.createVNode)("div", {
    "class": "g-component-loading"
  }, [(0, _vue.createTextVNode)("loading...")]);
};

exports.LoadComponentOnLoading = LoadComponentOnLoading;

var LoadComponent = function LoadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var loadingComponent = options.onLoading || _core.coreConfig.LoadComponentOnLoading;
  var errorComponent = options.onError || _core.coreConfig.LoadComponentOnError;

  var component = function component(props, context) {
    var store = _core.coreConfig.UseStore();

    var result;
    var errorMessage = '';

    try {
      result = (0, _core.injectComponent)(moduleName, componentName, store);

      if (_core.env.isServer && (0, _core.isPromise)(result)) {
        result = undefined;
        throw 'can not use async component in SSR';
      }
    } catch (e) {
      _core.env.console.error(e);

      errorMessage = e.message || "" + e;
    }

    if (result) {
      if ((0, _core.isPromise)(result)) {
        return (0, _vue.h)((0, _vue.defineAsyncComponent)({
          loader: function loader() {
            return result;
          },
          errorComponent: errorComponent,
          loadingComponent: loadingComponent
        }), props, context.slots);
      } else {
        return (0, _vue.h)(result, props, context.slots);
      }
    } else {
      return (0, _vue.h)(errorComponent, null, errorMessage);
    }
  };

  return component;
};

exports.LoadComponent = LoadComponent;