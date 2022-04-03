import { env } from '@elux/core';
import { renderToString } from '@elux/vue-components/server';
import { EluxContextKey } from './base';
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
    return renderToString(app);
  }

};
export default AppRender;