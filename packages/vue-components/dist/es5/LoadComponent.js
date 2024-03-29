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
      var active = true;
      var viewRef = shallowRef(OnLoading);
      var store = coreConfig.UseStore();

      var update = function update(view) {
        if (active) {
          viewRef.value = view;
        }
      };

      watch(function () {
        return store.sid;
      }, function () {
        var SyncView = OnLoading;

        try {
          var result = injectComponent(moduleName, componentName, store);

          if (isPromise(result)) {
            if (env.isServer) {
              throw 'can not use async component in SSR';
            }

            result.then(function (view) {
              update(view || 'not found!');
            }, function (e) {
              env.console.error(e);
              update(e.message || "" + e || 'error');
            });
          } else {
            SyncView = result;
          }
        } catch (e) {
          env.console.error(e);
          SyncView = e.message || "" + e || 'error';
        }

        update(SyncView);
      }, {
        immediate: true
      });
      onBeforeUnmount(function () {
        active = false;
      });
      return function () {
        var View = viewRef.value;

        if (typeof View === 'string') {
          return h(OnError, {
            message: View
          });
        } else if (View === OnLoading) {
          return h(OnLoading);
        } else {
          return h(View, props, context.slots);
        }
      };
    }
  });
  return component;
};