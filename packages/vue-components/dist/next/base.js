import { createTextVNode as _createTextVNode, createVNode as _createVNode } from "vue";
import { env, buildConfigSetter } from '@elux/core';
export const vueComponentsConfig = {
  setPageTitle(title) {
    return env.document.title = title;
  },

  Provider: null,
  LoadComponentOnError: ({
    message
  }) => _createVNode("div", {
    "class": "g-component-error"
  }, [message]),
  LoadComponentOnLoading: () => _createVNode("div", {
    "class": "g-component-loading"
  }, [_createTextVNode("loading...")])
};
export const setVueComponentsConfig = buildConfigSetter(vueComponentsConfig);
export const EluxContextKey = '__EluxContext__';