import { createTextVNode as _createTextVNode, createVNode as _createVNode } from "vue";
import { coreConfig, env, injectComponent, isPromise } from '@elux/core';
import { defineComponent, h, onBeforeUnmount, shallowRef, watch } from 'vue';
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
      const execute = () => {
        let SyncView = OnLoading;

        try {
          const result = injectComponent(moduleName, componentName, store);

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
            SyncView = result;
          }
        } catch (e) {
          env.console.error(e);
          SyncView = e.message || `${e}` || 'error';
        }

        return SyncView;
      };

      const store = coreConfig.UseStore();
      const View = shallowRef(execute());
      let active = true;
      onBeforeUnmount(() => {
        active = false;
      });
      watch(() => store.sid, execute);
      return () => {
        const view = View.value;

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