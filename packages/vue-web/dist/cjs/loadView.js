"use strict";

exports.__esModule = true;
exports.setLoadViewOptions = setLoadViewOptions;
exports.loadView = void 0;

var _core = require("@elux/core");

var _vue = require("vue");

var loadViewDefaultOptions = {
  LoadViewOnError: function LoadViewOnError() {
    return (0, _vue.h)('div', {
      class: 'g-view-error'
    });
  },
  LoadViewOnLoading: function LoadViewOnLoading() {
    return (0, _vue.h)('div', {
      class: 'g-view-loading'
    });
  }
};

function setLoadViewOptions(_ref) {
  var LoadViewOnError = _ref.LoadViewOnError,
      LoadViewOnLoading = _ref.LoadViewOnLoading;
  LoadViewOnError && (loadViewDefaultOptions.LoadViewOnError = LoadViewOnError);
  LoadViewOnLoading && (loadViewDefaultOptions.LoadViewOnLoading = LoadViewOnLoading);
}

var loadView = function loadView(moduleName, viewName, options) {
  var component = function component(props, context) {
    var errorComponent = (options == null ? void 0 : options.OnError) || loadViewDefaultOptions.LoadViewOnError;
    var result;
    var errorMessage = '';

    try {
      result = (0, _core.getComponet)(moduleName, viewName, true);
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
          loadingComponent: (options == null ? void 0 : options.OnLoading) || loadViewDefaultOptions.LoadViewOnLoading
        }), props, context.slots);
      }

      return (0, _vue.h)(result, props, context.slots);
    }

    return (0, _vue.h)(errorComponent, null, errorMessage);
  };

  return component;
};

exports.loadView = loadView;