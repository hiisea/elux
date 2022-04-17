import type {App} from 'vue';

import {EluxContext, env, IAppRender} from '@elux/core';

import {EluxContextKey, vueComponentsConfig} from './base';

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
    return vueComponentsConfig.renderToString!(app);
  },
  toProvider(eluxContext, app: App, store): Elux.Component<{children: any}> {
    app.provide<EluxContext>(EluxContextKey, eluxContext);
    return () => <div></div>;
  },
};

export default AppRender;
