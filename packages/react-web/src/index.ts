import {ComponentType} from 'react';
import {Facade, defineModuleGetter} from '@elux/core';
import {setReactComponentsConfig, loadComponent, LoadComponentOptions, useRouter} from '@elux/react-components';
import {renderToString, renderToDocument} from '@elux/react-components/stage';
import {createBaseApp, createBaseSSR, setAppConfig, setUserConfig, CreateApp, CreateSSR, UserConfig, GetBaseFacade} from '@elux/app';
import {createRouter, createBrowserHistory, createServerHistory} from '@elux/route-browser';
import {Provider, useStore} from '@elux/react-redux';

export {DocumentHead, Switch, Else, Link} from '@elux/react-components';
export type {DocumentHeadProps, SwitchProps, ElseProps, LinkProps, LoadComponentOptions} from '@elux/react-components';
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

export * from '@elux/react-redux';

setAppConfig({loadComponent, useRouter, useStore: useStore as any});
setReactComponentsConfig({Provider: Provider as any, useStore: useStore as any});

/*** @public */
export type GetFacade<F extends Facade, R extends string = 'route'> = GetBaseFacade<F, LoadComponentOptions, R>;

/**
 * 全局参数设置
 *
 * @remarks
 * 必须放在初始化最前面，通常没必要也不支持二次修改
 *
 * - UserConfig：{@link UserConfig | UserConfig}
 *
 * - LoadComponentOnError：用于LoadComponent(...)，组件加载失败时的显示组件，此设置为全局默认，LoadComponent方法中可以单独设置
 *
 * - LoadComponentOnLoading：用于LoadComponent(...)，组件加载中的Loading组件，此设置为全局默认，LoadComponent方法中可以单独设置
 *
 * @param conf - 参数
 *
 * @public
 */
export function setConfig(
  conf: UserConfig & {LoadComponentOnError?: ComponentType<{message: string}>; LoadComponentOnLoading?: ComponentType<{}>}
): void {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}

/*** @public */
export const createApp: CreateApp<{}> = (moduleGetter, storeMiddlewares, storeLogger) => {
  defineModuleGetter(moduleGetter);
  const history = createBrowserHistory();
  const router = createRouter(history, {});
  return createBaseApp({}, router, renderToDocument, (data) => data, storeMiddlewares, storeLogger);
};

/*** @public */
export const createSSR: CreateSSR<{}> = (moduleGetter, url, nativeData, storeMiddlewares, storeLogger) => {
  defineModuleGetter(moduleGetter);
  const history = createServerHistory(url);
  const router = createRouter(history, nativeData);
  return createBaseSSR({}, router, renderToString, (data) => data, storeMiddlewares, storeLogger);
};
