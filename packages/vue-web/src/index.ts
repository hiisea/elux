import {Component, createSSRApp, createApp as createVue, reactive, App} from 'vue';
import {Facade, setCoreConfig, defineModuleGetter} from '@elux/core';
import {setVueComponentsConfig, loadComponent, LoadComponentOptions, useRouter, useStore} from '@elux/vue-components';
import {renderToString, renderToDocument, Router} from '@elux/vue-components/stage';
import {createBaseApp, createBaseSSR, setAppConfig, setUserConfig, CreateApp, CreateSSR, UserConfig, GetBaseFacade} from '@elux/app';
import {createRouter, createBrowserHistory, createServerHistory} from '@elux/route-browser';

export {DocumentHead, Switch, Else, Link} from '@elux/vue-components';
export type {DocumentHeadProps, SwitchProps, ElseProps, LinkProps, LoadComponentOptions} from '@elux/vue-components';
export {
  errorAction,
  LoadingState,
  env,
  effect,
  reducer,
  setLoading,
  effectLogger,
  isServer,
  deepMerge,
  exportModule,
  exportView,
  exportComponent,
  modelHotReplacement,
  EmptyModel,
  BaseModel,
  RouteModel,
  loadModel,
  getModule,
  getComponent,
} from '@elux/core';
export type {Facade, Dispatch, UStore, DeepPartial, StoreMiddleware, StoreLogger, CommonModule, Action, HistoryAction} from '@elux/core';
export type {
  GetState,
  EluxComponent,
  AsyncEluxComponent,
  CommonModelClass,
  ModuleAPI,
  ReturnComponents,
  GetPromiseModule,
  GetPromiseComponent,
  ModuleState,
  RootState,
  CommonModel,
  RouteState,
  ActionsThis,
  PickHandler,
  ModuleGetter,
  LoadComponent,
  HandlerThis,
  FacadeStates,
  FacadeModules,
  FacadeActions,
  FacadeRoutes,
  PickActions,
  UNListener,
  ActionCreator,
} from '@elux/core';
export {location, createRouteModule, safeJsonParse} from '@elux/route';
export type {
  NativeLocationMap,
  EluxLocation,
  NativeLocation,
  StateLocation,
  URouter,
  UHistoryRecord,
  ULocationTransform,
  PagenameMap,
} from '@elux/route';
export {getApi, patchActions} from '@elux/app';
export type {ComputedStore, GetBaseFacade, UserConfig, CreateApp, CreateSSR, RenderOptions} from '@elux/app';

setCoreConfig({MutableData: true});
setAppConfig({loadComponent, useRouter, useStore});

/*** @public */
export type GetFacade<F extends Facade, R extends string = 'route'> = GetBaseFacade<F, LoadComponentOptions, R>;

/*** @public */
export function setConfig(conf: UserConfig & {LoadComponentOnError?: Component<{message: string}>; LoadComponentOnLoading?: Component<{}>}): void {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}

/*** @public */
export const createApp: CreateApp<App> = (moduleGetter, storeMiddlewares, storeLogger) => {
  defineModuleGetter(moduleGetter);
  const app = createVue(Router);
  const history = createBrowserHistory();
  const router = createRouter(history, {});
  return createBaseApp(app, router, renderToDocument, reactive, storeMiddlewares, storeLogger);
};

/*** @public */
export const createSSR: CreateSSR<App> = (moduleGetter, url, nativeData, storeMiddlewares, storeLogger) => {
  defineModuleGetter(moduleGetter);
  const app = createSSRApp(Router);
  const history = createServerHistory(url);
  const router = createRouter(history, nativeData);
  return createBaseSSR(app, router, renderToString, reactive, storeMiddlewares, storeLogger);
};
