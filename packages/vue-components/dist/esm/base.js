import { createTextVNode as _createTextVNode, createVNode as _createVNode } from "vue";
import { env, buildConfigSetter } from '@elux/core';
export var vueComponentsConfig = {
  setPageTitle: function setPageTitle(title) {
    return env.document.title = title;
  },
  Provider: null,
  LoadComponentOnError: function LoadComponentOnError(_ref) {
    var message = _ref.message;
    return _createVNode("div", {
      "class": "g-component-error"
    }, [message]);
  },
  LoadComponentOnLoading: function LoadComponentOnLoading() {
    return _createVNode("div", {
      "class": "g-component-loading"
    }, [_createTextVNode("loading...")]);
  }
};
export var setVueComponentsConfig = buildConfigSetter(vueComponentsConfig);
export var EluxContextKey = '__EluxContext__';
export var EluxStoreContextKey = '__EluxStoreContext__';