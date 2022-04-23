import { createTextVNode as _createTextVNode, createVNode as _createVNode } from "vue";
import { h, defineComponent, onBeforeUnmount, shallowRef } from 'vue';
import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
export var LoadComponentOnError = function LoadComponentOnError(_ref) {
  var message = _ref.message;
  return _createVNode("div", {
    "class": "g-component-error"
  }, [message]);
};
export var LoadComponentOnLoading = function LoadComponentOnLoading() {
  return _createVNode("div", {
    "class": "g-component-loading"
  }, [_createTextVNode("loading...")]);
};
export var LoadComponent = function LoadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  var OnError = options.onError || coreConfig.LoadComponentOnError;
  var component = defineComponent({
    setup: function setup(props, context) {
      var store = coreConfig.UseStore();
      var View = shallowRef(OnLoading);

      var execute = function execute(curStore) {
        try {
          var result = injectComponent(moduleName, componentName, curStore || store);

          if (isPromise(result)) {
            if (env.isServer) {
              throw 'can not use async component in SSR';
            }

            result.then(function (view) {
              active && (View.value = view || 'not found!');
            }, function (e) {
              env.console.error(e);
              active && (View.value = e.message || "" + e || 'error');
            });
          } else {
            View.value = result;
          }
        } catch (e) {
          env.console.error(e);
          View.value = e.message || "" + e || 'error';
        }
      };

      var active = true;
      onBeforeUnmount(function () {
        active = false;
      });
      execute();
      return function () {
        if (typeof View.value === 'string') {
          return h(OnError, {
            message: View.value
          });
        } else {
          return h(View.value, props, context.slots);
        }
      };
    }
  });
  return component;
};