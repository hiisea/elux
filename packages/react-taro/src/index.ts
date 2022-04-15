import {AppConfig} from '@elux/app';
import {buildProvider, getAppProvider} from '@elux/core';
import {createRouter} from '@elux/route-mp';
import {taroHistory} from '@elux/taro';

export {DocumentHead, Else, Link, Switch} from '@elux/react-components';
export type {DocumentHeadProps, ElseProps, LinkProps, SwitchProps} from '@elux/react-components';

export {connectRedux, createSelectorHook, shallowEqual, useSelector} from '@elux/react-redux';
export type {GetProps, InferableComponentEnhancerWithProps} from '@elux/react-redux';

export * from '@elux/app';

/**
 * @public
 */
export type EluxApp = {
  render(): Elux.Component<{children: any}>;
};

let cientSingleton: EluxApp = undefined as any;

/**
 * 创建应用(CSR)
 *
 * @remarks
 * 应用唯一的创建入口，用于客户端渲染(CSR)。服务端渲染(SSR)请使用{@link createSSR}
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
  const router = createRouter(taroHistory);
  cientSingleton = {
    render() {
      return getAppProvider();
    },
  };
  return buildProvider({}, router);
}
