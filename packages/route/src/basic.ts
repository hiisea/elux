import {buildConfigSetter, env, RootState, DeepPartial} from '@elux/core';

/**
 * 内置3种路由描述之一
 *
 * @remarks
 * 框架中内置3种路由描述分别是：NativeLocation，EluxLocation，StateLocation，其中 StateLocation 为`标准形态`，其余2种为临时形态
 *
 * 对应的3种Url路由协议分别是：`n://xxx?_={...}`，`e://xxx?{...}`，`s://xxx?{...}`
 *
 * 其转换关系通常为：NativeLocation -\> EluxLocation -\> StateLocation
 *
 * 以 e 开头的 URL，如：`e://login?{"state":{"userName":"jimmy"}}`，表示此为 `EluxLocation`
 *
 * EluxLocation 通常来源于经过{@link NativeLocationMap.in} 转换后的 {@link NativeLocation}，并最终通过 {@link PagenameMap} 转换为路由标准形态 {@link StateLocation}。
 *
 * @public
 */
export interface EluxLocation<P extends RootState = RootState> {
  /**
   * EluxUrl 中的 path 部分称为 `pathmatch`
   *
   * @remarks
   * 通常它由 {@link NativeLocation.pathname} 通过 {@link NativeLocationMap.in} 转换而来，并将最终通过{@link PagenameMap} 提取 `PathParams` 后转换为 {@link StateLocation.pagename}
   */
  pathmatch: string;
  /**
   * EluxUrl 中的传参部分称为 `args`
   *
   * @remarks
   * 通常它由 {@link NativeLocation.query} 通过 {@link routeJsonParse}转换而来，并将合并 {@link PagenameMap | PathParams} 后转化为 {@link StateLocation.payload}
   */
  args: DeepPartial<P>;
}

/**
 * 内置3种路由描述之一
 *
 * @remarks
 * 框架中内置3种路由描述分别是：NativeLocation，EluxLocation，StateLocation，其中 StateLocation 为`标准形态`，其余2种为临时形态
 *
 * 对应的3种Url路由协议分别是：`n://xxx?_={...}`，`e://xxx?{...}`，`s://xxx?{...}`
 *
 * 其转换关系通常为：NativeLocation -\> EluxLocation -\> StateLocation
 *
 * 以 n 开头的 URL，如：`n://login?_={"state":{"userName":"jimmy"}}`，表示此为 `NativeLocation`
 *
 * NativeLocation 通常来源于运行平台，它不直接在框架中流通和参与计算，将在第一时间通过 {@link NativeLocationMap.in} 转换为{@link EluxLocation}，
 * 并在需要通知运行平台路由系统时，通过 {@link NativeLocationMap.out} 转化为原生路由描述
 *
 * @public
 */
export interface NativeLocation {
  /**
   * NativeUrl 中的 path 部分称为 `pathname`
   *
   * @remarks
   * 其值将通过 {@link NativeLocationMap.in} 转换成为 {@link EluxLocation.pathmatch}
   */
  pathname: string;
  /**
   * NativeUrl 中的传参部分称为 `query`，其值通过 {@link routeJsonParse} 反序列化后转换为 {@link EluxLocation.args}
   */
  query: string;
}

/**
 * 内置3种路由描述之一
 *
 * @remarks
 * 框架中内置3种路由描述分别是：NativeLocation，EluxLocation，StateLocation，其中 StateLocation 为`标准形态`，其余2种为临时形态
 *
 * 对应的3种Url路由协议分别是：`n://xxx?_={...}`，`e://xxx?{...}`，`s://xxx?{...}`
 *
 * 其转换关系通常为：NativeLocation -\> EluxLocation -\> StateLocation
 *
 * 以 s 开头的 URL，如：`s://login?{"state":{"userName":"jimmy"}}`，表示此为 `StateLocation`
 *
 * StateLocation 是框架中路由请求的`标准形态`，它通常由 {@link EluxLocation} 通过 {@link PagenameMap} 转换为而来
 *
 * @public
 */
export interface StateLocation<P extends RootState = RootState, N extends string = string> {
  /**
   * StateLocation 中的 path 部分称为 `pagename`
   *
   * @remarks
   * 其值即为 {@link PagenameMap} 中定义的key
   */
  pagename: N;
  /**
   * StateLocation 中的传参部分称为 `payload`
   *
   * @remarks
   * 其值是 {@link EluxLocation.args} 和 {@link PagenameMap | PagenameMap.pathToParams} 合并而来，参见{@link RouteState.params}
   */
  payload: DeepPartial<P>;
}

/**
 * NativeLocation与EluxLocation的转换
 *
 * @public
 */
export interface NativeLocationMap {
  /**
   * NativeLocation不会直接在框架中流通和参与计算，它将在第一时间通过该方法转换为{@link EluxLocation}
   */
  in(nativeLocation: NativeLocation): EluxLocation;
  /**
   * 当需要通知原生路由时，通过该方法转换为原生路由描述
   */
  out(eluxLocation: EluxLocation): NativeLocation;
}

/**
 * 定义路由Page及映射PathParams
 *
 * @remarks
 * {@link EluxLocation.pathmatch} 中可以隐式的映射某些 params 参数（可称之为 `PathParams`），此处定义如何提取和还原 PathParams
 *
 * - key 名即为 {@link RouteState.pagename}
 *
 * - `pathToParams` 提取 {@link EluxLocation.pathmatch} 中的传参，并映射成为 `PathParams`，并与 {@link EluxLocation.args} 合并后作为 {@link StateLocation.payload}
 *
 * - `paramsToPath` 将 {@link StateLocation.payload} 中的某些参数作为 `PathParams`，放入 {@link EluxLocation.pathmatch} 中储存
 *
 * - `pageComponent` 通常无需设置，如需特别指定该Page的UI组件，可在此定义
 *
 * @public
 */
export type PagenameMap<TPagenames extends string = string> = {
  [K in TPagenames]: {
    pathToParams(pathArgs: Array<string | undefined>): Record<string, any>;
    paramsToPath(params: Record<string, any>): Array<string | undefined>; // TODO vue下类型推导出错？paramsToArgs(params: Record<string, any>): Array<any>;
    pageComponent?: any;
  };
};
export interface RouteConfig {
  //RouteModuleName: string;
  maxHistory: number;
  maxLocationCache: number;
  notifyNativeRouter: {
    root: boolean;
    internal: boolean;
  };
  indexUrl: string;
  notfoundPagename: string;
  paramsKey: string;
}
export const routeConfig: RouteConfig = {
  //RouteModuleName: 'route',
  maxHistory: 10,
  maxLocationCache: env.isServer ? 10000 : 500,
  notifyNativeRouter: {
    root: true,
    internal: false,
  },
  indexUrl: '/index',
  notfoundPagename: '/404',
  paramsKey: '_',
};

export const setRouteConfig = buildConfigSetter(routeConfig);

export const routeMeta: {
  defaultParams: Record<string, any>;
  pageComponents: Record<string, any>;
  pagenameMap: Record<string, any>;
  pagenameList: string[];
  nativeLocationMap: NativeLocationMap;
} = {
  defaultParams: {},
  pageComponents: {},
  pagenameMap: {},
  pagenameList: [],
  nativeLocationMap: {} as any,
};

/**
 * 解析JSON格式的路由参数
 *
 * @remarks
 * 框架中将路由参数直接序列化为JSON字符串，放入URL参数中，该方法用来反解析该字符串，如解析失败将返回空的`{}`，不会throw error
 *
 * @param json - 形如`{...}`的JSON字符串
 *
 * @public
 */
export function routeJsonParse(json: string): Record<string, any> {
  if (!json || json === '{}' || json.charAt(0) !== '{' || json.charAt(json.length - 1) !== '}') {
    return {};
  }
  let args = {};
  try {
    args = JSON.parse(json);
  } catch (error) {
    args = {};
  }
  return args;
}
