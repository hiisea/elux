"use strict";

exports.__esModule = true;
exports.default = void 0;

var _core = require("@elux/core");

var _vue = require("vue");

var _base = require("./base");

var loadComponent = function loadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var loadingComponent = options.OnLoading || _base.vueComponentsConfig.LoadComponentOnLoading;
  var errorComponent = options.OnError || _base.vueComponentsConfig.LoadComponentOnError;

  var component = function component(props, context) {
    var _inject = (0, _vue.inject)(_base.EluxContextKey, {
      documentHead: ''
    }),
        deps = _inject.deps;

    var _inject2 = (0, _vue.inject)(_base.EluxStoreContextKey, {
      store: null
    }),
        store = _inject2.store;

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

var _default = loadComponent;
exports.default = _default;