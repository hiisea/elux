import {Component, createSSRApp, createApp as createVue} from 'vue';
import type {App} from 'vue';
import {RootModuleFacade, setCoreConfig} from '@elux/core';
import {setVueComponentsConfig, loadComponent, LoadComponentOptions} from '@elux/vue-components';
import {renderToString, renderToDocument, RootComponent} from '@elux/vue-components/stage';
import {
  createBaseApp,
  createBaseSSR,
  setAppConfig,
  setUserConfig,
  CreateApp,
  CreateSSR,
  LocationTransform,
  UserConfig,
  GetBaseAPP,
  RenderOptions,
  IStore,
} from '@elux/app';
import {createRouter} from '@elux/route-browser';

export * from '@elux/vue-components';
export * from '@elux/app';

declare module '@vue/runtime-core' {
  interface App {
    render: (options?: RenderOptions) => Promise<IStore | string>;
  }
}

setCoreConfig({MutableData: true});
setAppConfig({loadComponent});

export type GetApp<A extends RootModuleFacade> = GetBaseAPP<A, LoadComponentOptions>;

export function setConfig(conf: UserConfig & {LoadComponentOnError?: Component<{message: string}>; LoadComponentOnLoading?: Component<{}>}): void {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}

export const createApp: CreateApp<App> = (moduleGetter, middlewares, appModuleName) => {
  const app = createVue(RootComponent);
  return createBaseApp(
    app,
    (locationTransform: LocationTransform) => createRouter('Browser', locationTransform),
    renderToDocument,
    moduleGetter,
    middlewares,
    appModuleName
  );
};
export const createSSR: CreateSSR<App> = (moduleGetter, url, middlewares, appModuleName) => {
  const app = createSSRApp(RootComponent);
  return createBaseSSR(
    app,
    (locationTransform: LocationTransform) => createRouter(url, locationTransform),
    renderToString,
    moduleGetter,
    middlewares,
    appModuleName
  );
};

// // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// export function createApp(moduleGetter: ModuleGetter, middlewares: IStoreMiddleware[] = [], appModuleName?: string) {
//   defineModuleGetter(moduleGetter, appModuleName);
//   const istoreMiddleware = [routeMiddleware, ...middlewares];
//   const routeModule = getModule('route') as RouteModule;
//   return {
//     useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
//       const app = createVue(RootComponent);
//       app.render = function ({id = 'root', ssrKey = 'eluxInitStore', viewName}: RenderOptions = {}) {
//         const router = createRouter('Browser', routeModule.locationTransform);
//         MetaData.router = router;
//         const {state, components = []}: {state: any; components: string[]} = env[ssrKey] || {};
//         return router.initedPromise.then((routeState) => {
//           const initState = {...storeOptions.initState, route: routeState, ...state};
//           const baseStore = storeCreator({...storeOptions, initState});
//           return renderApp(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(({store, AppView}) => {
//             StageView = AppView;
//             routeModule.model(store);
//             router.setStore(store);
//             app.use(store as any);
//             app.provide<EluxContextType>(EluxContextKey, {store, documentHead: ''});
//             if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
//               env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
//             }
//             app.mount(`#${id}`);
//             return store;
//           });
//         });
//       };
//       return app;
//     },
//   };
// }

// // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// export function createSsrApp(moduleGetter: ModuleGetter, middlewares: IStoreMiddleware[] = [], appModuleName?: string) {
//   setSsrHtmlTpl('');
//   defineModuleGetter(moduleGetter, appModuleName);
//   const istoreMiddleware = [routeMiddleware, ...middlewares];
//   const routeModule = getModule('route') as RouteModule;
//   return {
//     useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
//       const app = createSSRApp(RootComponent);
//       app.render = function ({id = 'root', ssrKey = 'eluxInitStore', url = '/', viewName}: RenderOptions = {}) {
//         if (!SSRTPL) {
//           SSRTPL = env.decodeBas64('process.env.ELUX_ENV_SSRTPL');
//         }
//         const router = createRouter(url, routeModule.locationTransform);
//         MetaData.router = router;
//         return router.initedPromise.then((routeState) => {
//           const initState = {...storeOptions.initState, route: routeState};
//           const baseStore = storeCreator({...storeOptions, initState});
//           return ssrApp(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(({store, AppView}) => {
//             StageView = AppView;
//             const state = store.getState();
//             const eluxContext = {deps: {}, store, documentHead: ''};
//             app.use(store as any);
//             app.provide<EluxContextType>(EluxContextKey, eluxContext);
//             // eslint-disable-next-line @typescript-eslint/no-var-requires
//             const htmlPromise: Promise<string> = require('@vue/server-renderer').renderToString(app);
//             return htmlPromise.then((html) => {
//               const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
//               if (match) {
//                 return SSRTPL.replace(
//                   '</head>',
//                   `\r\n${eluxContext.documentHead}\r\n<script>window.${ssrKey} = ${JSON.stringify({
//                     state,
//                     components: Object.keys(eluxContext.deps),
//                   })};</script>\r\n</head>`
//                 ).replace(match[0], match[0] + html);
//               }
//               return html;
//             });
//           });
//         });
//       };
//       return app;
//     },
//   };
// }
