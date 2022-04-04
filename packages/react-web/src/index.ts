import {buildApp, buildSSR, NativeRequest} from '@elux/core';
import {createClientRouter, createServerRouter} from '@elux/route-browser';
import {AppConfig} from '@elux/app';

export {DocumentHead, Switch, Else, Link} from '@elux/react-components';
export type {DocumentHeadProps, SwitchProps, ElseProps, LinkProps} from '@elux/react-components';

export {connectRedux, shallowEqual, useSelector, createSelectorHook} from '@elux/react-redux';
export type {InferableComponentEnhancerWithProps, GetProps} from '@elux/react-redux';

export * from '@elux/app';

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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createApp(appConfig: AppConfig) {
  const router = createClientRouter();
  return buildApp({}, router);
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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createSSR(appConfig: AppConfig, nativeRequest: NativeRequest) {
  const router = createServerRouter(nativeRequest);
  return buildSSR({}, router);
}
