import { createTextVNode as _createTextVNode, createVNode as _createVNode } from "vue";
import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
import { defineComponent, h, onBeforeUnmount, shallowRef, watch } from 'vue';
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
    name: 'EluxComponentLoader',
    setup: function setup(props, context) {
      var execute = function execute() {
        var SyncView = OnLoading;

        try {
          var result = injectComponent(moduleName, componentName, store);

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
            SyncView = result;
          }
        } catch (e) {
          env.console.error(e);
          SyncView = e.message || "" + e || 'error';
        }

        return SyncView;
      };

      var store = coreConfig.UseStore();
      var View = shallowRef(execute());
      var active = true;
      onBeforeUnmount(function () {
        active = false;
      });
      watch(function () {
        return store.sid;
      }, execute);
      return function () {
        var view = View.value;

        if (typeof view === 'string') {
          return h(OnError, {
            message: view
          });
        } else if (view === OnLoading) {
          return h(view);
        } else {
          return h(view, props, context.slots);
        }
      };
    }
  });
  return component;
};