"use strict";

exports.__esModule = true;
exports.setLoadComponentOptions = setLoadComponentOptions;
exports.loadComponent = void 0;

var _core = require("@elux/core");

var _vue = require("vue");

var _sington = require("./sington");

var loadComponentDefaultOptions = {
  LoadComponentOnError: function LoadComponentOnError() {
    return (0, _vue.h)('div', {
      class: 'g-component-error'
    });
  },
  LoadComponentOnLoading: function LoadComponentOnLoading() {
    return (0, _vue.h)('div', {
      class: 'g-component-loading'
    });
  }
};

function setLoadComponentOptions(_ref) {
  var LoadComponentOnError = _ref.LoadComponentOnError,
      LoadComponentOnLoading = _ref.LoadComponentOnLoading;
  LoadComponentOnError && (loadComponentDefaultOptions.LoadComponentOnError = LoadComponentOnError);
  LoadComponentOnLoading && (loadComponentDefaultOptions.LoadComponentOnLoading = LoadComponentOnLoading);
}

var loadComponent = function loadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var loadingComponent = options.OnLoading || loadComponentDefaultOptions.LoadComponentOnLoading;
  var errorComponent = options.OnError || loadComponentDefaultOptions.LoadComponentOnError;

  var component = function component(props, context) {
    var _inject = (0, _vue.inject)(_sington.EluxContextKey, {
      documentHead: ''
    }),
        deps = _inject.deps,
        store = _inject.store;

    var result;
    var errorMessage = '';

    try {
      result = (0, _core.loadComponet)(moduleName, componentName, store, deps || {});
    } catch (e) {
      _core.env.console.error(e);

      errorMessage = e.message || "" + e;
    }

    if (result !== undefined) {
      if (result === null) {
        return (0, _vue.h)(loadingComponent);
      }

      if ((0, _core.isPromise)(result)) {
        return (0, _vue.h)((0, _vue.defineAsyncComponent)({
          loader: function loader() {
            return result;
          },
          errorComponent: errorComponent,
          loadingComponent: loadingComponent
        }), props, context.slots);
      }

      return (0, _vue.h)(result, props, context.slots);
    }

    return (0, _vue.h)(errorComponent, null, errorMessage);
  };

  return component;
};

exports.loadComponent = loadComponent;