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
      let active = true;
      const viewRef = shallowRef(OnLoading);
      const store = coreConfig.UseStore();

      const update = view => {
        if (active) {
          viewRef.value = view;
        }
      };

      watch(() => store.sid, () => {
        let SyncView = OnLoading;

        try {
          const result = injectComponent(moduleName, componentName, store);

          if (isPromise(result)) {
            if (env.isServer) {
              throw 'can not use async component in SSR';
            }

            result.then(view => {
              update(view || 'not found!');
            }, e => {
              env.console.error(e);
              update(e.message || `${e}` || 'error');
            });
          } else {
            SyncView = result;
          }
        } catch (e) {
          env.console.error(e);
          SyncView = e.message || `${e}` || 'error';
        }

        update(SyncView);
      }, {
        immediate: true
      });
      onBeforeUnmount(() => {
        active = false;
      });
      return () => {
        const View = viewRef.value;

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