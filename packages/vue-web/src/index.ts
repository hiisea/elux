import {Component, createSSRApp, createApp as createVue, reactive, App} from 'vue';
import {Facade, setCoreConfig, defineModuleGetter, ModuleGetter, StoreMiddleware, StoreLogger} from '@elux/core';
import {setVueComponentsConfig, loadComponent, LoadComponentOptions, useRouter, useStore} from '@elux/vue-components';
import {renderToString, renderToDocument, Router} from '@elux/vue-components/stage';
import {createBaseApp, createBaseSSR, setAppConfig, setUserConfig, UserConfig, GetBaseFacade, RenderOptions} from '@elux/app';
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
  loadModel,
  getModule,
  getComponent,
} from '@elux/core';
export type {Facade, Dispatch, UStore, DeepPartial, StoreMiddleware, StoreLogger, CommonModule, Action, RouteHistoryAction} from '@elux/core';
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
export {location, createRouteModule, routeJsonParse} from '@elux/route';
export type {
  NativeLocationMap,
  EluxLocation,
  NativeLocation,
  StateLocation,
  URouter,
  URouteRecord,
  ULocationTransform,
  PagenameMap,
} from '@elux/route';
export {getApi} from '@elux/app';
export type {ComputedStore, GetBaseFacade, UserConfig, RenderOptions} from '@elux/app';

setCoreConfig({MutableData: true});
setAppConfig({loadComponent, useRouter, useStore});

/**
 * 获取应用顶级API类型
 *
 * @remarks
 * - `TFacade`: 各模块接口，可通过`Facade<ModuleGetter>`获取
 *
 * - `TRouteModuleName`: 路由模块名称，默认为`route`
 *
 * @typeParam TFacade - 各模块接口，可通过`Facade<ModuleGetter>`获取
 * @typeParam TRouteModuleName - 路由模块名称，默认为`route`
 *
 * @public
 */
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
 * @param conf - 全局参数
 *
 * @public
 */
export function setConfig(conf: UserConfig & {LoadComponentOnError?: Component<{message: string}>; LoadComponentOnLoading?: Component<{}>}): void {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}

/**
 * 创建应用(CSR)
 *
 * @remarks
 * 应用唯一的创建入口，用于客户端渲染(CSR)。服务端渲染(SSR)请使用{@link createSSR | createSSR(...)}
 *
 * @param moduleGetter - 模块工厂
 * @param storeMiddlewares - store中间件
 * @param storeLogger - store日志记录器
 *
 * @returns
 * 返回包含`render(options: RenderOptions): Promise<void>`方法的下一步实例，参见{@link RenderOptions}
 *
 * @example
 * ```js
 * createApp(moduleGetter)
 * .render()
 * .then(() => {
 *   const initLoading = document.getElementById('root-loading');
 *   if (initLoading) {
 *     initLoading.parentNode!.removeChild(initLoading);
 *   }
 * });
 * ```
 *
 * @public
 */
export function createApp(
  moduleGetter: ModuleGetter,
  storeMiddlewares?: StoreMiddleware[],
  storeLogger?: StoreLogger
): App & {
  render({id, ssrKey, viewName}?: RenderOptions): Promise<void>;
} {
  defineModuleGetter(moduleGetter);
  const app = createVue(Router);
  const history = createBrowserHistory();
  const router = createRouter(history, {});
  return createBaseApp(app, router, renderToDocument, reactive, storeMiddlewares, storeLogger);
}

/**
 * 创建应用(SSR)
 *
 * @remarks
 * 应用唯一的创建入口，用于服务端渲染(SSR)。客户端渲染(CSR)请使用{@link createApp | createApp(...)}
 *
 * @param moduleGetter - 模块工厂
 * @param url - 服务器收到的原始url
 * @param nativeData - 可存放任何原始请求数据
 * @param storeMiddlewares - store中间件
 * @param storeLogger - store日志记录器
 *
 * @returns
 * 返回包含`render(options: RenderOptions): Promise<string>`方法的下一步实例，参见{@link RenderOptions}
 *
 * @example
 * ```js
 * export default function server(request: {url: string}, response: any): Promise<string> {
 *   return createSSR(moduleGetter, request.url, {request, response}).render();
 * }
 * ```
 * @public
 */
export function createSSR(
  moduleGetter: ModuleGetter,
  url: string,
  nativeData: any,
  storeMiddlewares?: StoreMiddleware[],
  storeLogger?: StoreLogger
): App & {
  render({id, ssrKey, viewName}?: RenderOptions): Promise<string>;
} {
  defineModuleGetter(moduleGetter);
  const app = createSSRApp(Router);
  const history = createServerHistory(url);
  const router = createRouter(history, nativeData);
  return createBaseSSR(app, router, renderToString, reactive, storeMiddlewares, storeLogger);
}
