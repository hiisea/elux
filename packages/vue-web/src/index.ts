import {App, createApp as createCSRApp, createSSRApp} from 'vue';

import {AppConfig} from '@elux/app';
import {buildApp, buildSSR, NativeRequest, RenderOptions} from '@elux/core';
import {createClientRouter, createServerRouter} from '@elux/route-browser';
import {RouterComponent, setVueComponentsConfig} from '@elux/vue-components';
// eslint-disable-next-line
import {renderToString} from '@elux/vue-web/server';

export {DocumentHead, Else, Link, Switch} from '@elux/vue-components';
export type {DocumentHeadProps, ElseProps, LinkProps, SwitchProps} from '@elux/vue-components';

export * from '@elux/app';

setVueComponentsConfig({
  renderToString,
});

/**
 * @public
 */
export type EluxApp = App & {
  render(options?: RenderOptions): Promise<void>;
};

let cientSingleton: EluxApp = undefined as any;

/**
 * 创建应用(CSR)
 *
 * @param appConfig - 应用配置
 *
 * @returns
 * 返回包含`render`方法的实例，参见{@link RenderOptions}
 *
 * @example
 * ```js
 * createApp(config)
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
export function createApp(appConfig: AppConfig): EluxApp {
  if (cientSingleton) {
    return cientSingleton;
  }
  const router = createClientRouter();
  const app = createCSRApp(RouterComponent);
  cientSingleton = Object.assign(app, {
    render() {
      return Promise.resolve();
    },
  });
  return buildApp(app, router);
}

/**
 * 创建应用(SSR)
 *
 * @remarks
 * 应用唯一的创建入口，用于服务端渲染(SSR)。客户端渲染(CSR)请使用{@link createApp}
 *
 * @param appConfig - 应用配置
 * @param nativeRequest - 原生请求
 *
 * @returns
 * 返回包含`render`方法的下一步实例，参见{@link RenderOptions}
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
  appConfig: AppConfig,
  nativeRequest: NativeRequest
): App & {
  render(options?: RenderOptions | undefined): Promise<string>;
} {
  const router = createServerRouter(nativeRequest);
  const app = createSSRApp(RouterComponent);
  return buildSSR(app, router);
}
