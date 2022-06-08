import {EluxContext, env, IAppRender} from '@elux/core';
import type {App} from 'vue';
import {EluxContextKey, vueComponentsConfig} from './base';

const AppRender: IAppRender = {
  toDocument(id, eluxContext, fromSSR, app: App): void {
    app.provide<EluxContext>(EluxContextKey, eluxContext);
    if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
    }
    app.mount(`#${id}`);
  },
  toString(id, eluxContext, app: App): Promise<string> {
    app.provide<EluxContext>(EluxContextKey, eluxContext);
    return vueComponentsConfig.renderToString!(app);
  },
  toProvider(eluxContext, app: App): Elux.Component<{children: any}> {
    app.provide<EluxContext>(EluxContextKey, eluxContext);
    return () => <div />;
  },
};

export default AppRender;
