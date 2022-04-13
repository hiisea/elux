import type {App} from 'vue';

import {EluxContext, env, IAppRender} from '@elux/core';
// eslint-disable-next-line
import {renderToString} from '@elux/vue-components/server';

import {EluxContextKey} from './base';

const AppRender: IAppRender = {
  toDocument(id, eluxContext, fromSSR, app: App, store): void {
    app.provide<EluxContext>(EluxContextKey, eluxContext);
    if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
    }
    app.mount(`#${id}`);
  },
  toString(id, eluxContext, app: App, store): Promise<string> {
    app.provide<EluxContext>(EluxContextKey, eluxContext);
    return renderToString(app);
  },
};

export default AppRender;
