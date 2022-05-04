import { createVNode as _createVNode } from "vue";
import { env } from '@elux/core';
import { EluxContextKey, vueComponentsConfig } from './base';
var AppRender = {
  toDocument: function toDocument(id, eluxContext, fromSSR, app) {
    app.provide(EluxContextKey, eluxContext);

    if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
    }

    app.mount("#" + id);
  },
  toString: function toString(id, eluxContext, app) {
    app.provide(EluxContextKey, eluxContext);
    return vueComponentsConfig.renderToString(app);
  },
  toProvider: function toProvider(eluxContext, app) {
    app.provide(EluxContextKey, eluxContext);
    return function () {
      return _createVNode("div", null, null);
    };
  }
};
export default AppRender;