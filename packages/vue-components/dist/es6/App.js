import { createVNode as _createVNode } from "vue";
import { env } from '@elux/core';
import { EluxContextKey, vueComponentsConfig } from './base';
const AppRender = {
  toDocument(id, eluxContext, fromSSR, app, store) {
    app.provide(EluxContextKey, eluxContext);

    if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
    }

    app.mount(`#${id}`);
  },

  toString(id, eluxContext, app, store) {
    app.provide(EluxContextKey, eluxContext);
    return vueComponentsConfig.renderToString(app);
  },

  toProvider(eluxContext, app, store) {
    app.provide(EluxContextKey, eluxContext);
    return () => _createVNode("div", null, null);
  }

};
export default AppRender;