import { createTextVNode as _createTextVNode, createVNode as _createVNode } from "vue";
import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
import { defineComponent, h, onBeforeUnmount, shallowRef } from 'vue';
export const LoadComponentOnError = ({
  message
}) => _createVNode("div", {
  "class": "g-component-error"
}, [message]);
export const LoadComponentOnLoading = () => _createVNode("div", {
  "class": "g-component-loading"
}, [_createTextVNode("loading...")]);
export const LoadComponent = (moduleName, componentName, options = {}) => {
  const OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  const OnError = options.onError || coreConfig.LoadComponentOnError;
  const component = defineComponent({
    name: 'EluxComponentLoader',

    setup(props, context) {
      const store = coreConfig.UseStore();
      const View = shallowRef(OnLoading);

      const execute = curStore => {
        try {
          const result = injectComponent(moduleName, componentName, curStore || store);

          if (isPromise(result)) {
            if (env.isServer) {
              throw 'can not use async component in SSR';
            }

            result.then(view => {
              active && (View.value = view || 'not found!');
            }, e => {
              env.console.error(e);
              active && (View.value = e.message || `${e}` || 'error');
            });
          } else {
            View.value = result;
          }
        } catch (e) {
          env.console.error(e);
          View.value = e.message || `${e}` || 'error';
        }
      };

      let active = true;
      onBeforeUnmount(() => {
        active = false;
      });
      execute();
      return () => {
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