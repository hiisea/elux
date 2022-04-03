import {ModuleGetter, StoreMiddleware, StoreLogger, setCoreConfig, getModuleApiMap} from '@elux/core';
import {setRouteConfig} from '@elux/route';

export {
  errorAction,
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
  getApi,
  EmptyModel,
  BaseModel,
  ErrorCodes,
} from '@elux/core';
export type {
  LoadingState,
  Facade,
  API,
  Dispatch,
  IStore,
  IRouter,
  StoreState,
  Location,
  StoreMiddleware,
  StoreLogger,
  CommonModule,
  CommonModel,
  Action,
  ActionError,
  RouteAction,
  RouteTarget,
  RouteRuntime,
} from '@elux/core';

export {locationToUrl, urlToLocation, toNativeLocation, toEluxLocation} from '@elux/route';

/*** @public */
export type ComputedStore<T> = {[K in keyof T]-?: () => T[K]};

/**
 * 全局参数设置
 *
 * @remarks
 * 可通过 {@link setConfig | setConfig(...)} 个性化设置（通常使用默认设置即可）
 *
 * @public
 */
export interface UserConfig {
  ModuleGetter: ModuleGetter;
  QueryString: {
    parse(str: string): {[key: string]: any};
    stringify(query: {[key: string]: any}): string;
  };
  HomeUrl: string;
  NativePathnameMapping?: {
    in(pathname: string): string;
    out(pathname: string): string;
  };
  /**
   * 超过多少秒Loading视为深度加载
   *
   * @remarks
   * 默认: `2`
   *
   * 框架将Loading状态分为3种：{@link LoadingState | LoadingState}，可根据不同的状态来个性化显示，如：浅度loading时仅显示icon图标，深度loading时显示icon图标+灰色蒙层
   *
   * @defaultValue `2`
   */
  DepthTimeOnLoading?: number;
  /**
   * APP根模块名称
   *
   * @remarks
   * 默认: `stage`
   *
   * APP根模块名称，通常约定为stage
   *
   * @defaultValue `stage`
   */
  StageModuleName?: string;
  StageViewName?: string;
  LoadComponentOnError?: Elux.Component<{message: string}>;
  LoadComponentOnLoading?: Elux.Component<{}>;
  StoreMiddlewares?: StoreMiddleware[];
  StoreLogger?: StoreLogger;
  /**
   * 不通知原生路由
   *
   * @remarks
   * 默认: `false`
   *
   * 框架有自己的路由体系，运行平台的原生路由体系作为外挂模式存在。默认情况下二者之间会建立关联，此设置为true可以彻底忽略原生路由体系。
   *
   * @defaultValue `false`
   */
  DisableNativeRouter?: boolean;
}

const appConfig = Symbol();

export type AppConfig = typeof appConfig;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function setConfig(conf: UserConfig): AppConfig {
  setCoreConfig(conf);
  setRouteConfig(conf);
  if (conf.DisableNativeRouter) {
    setRouteConfig({NotifyNativeRouter: {window: false, page: false}});
  }
  return appConfig;
}

export function patchActions(typeName: string, json?: string): void {
  if (json) {
    getModuleApiMap(JSON.parse(json));
  }
}
