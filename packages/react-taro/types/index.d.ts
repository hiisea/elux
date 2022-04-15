import { AppConfig } from '@elux/app';
export { DocumentHead, Else, Link, Switch } from '@elux/react-components';
export type { DocumentHeadProps, ElseProps, LinkProps, SwitchProps } from '@elux/react-components';
export { connectRedux, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
export type { GetProps, InferableComponentEnhancerWithProps } from '@elux/react-redux';
export * from '@elux/app';
/**
 * @public
 */
export declare type EluxApp = {
    render(): Elux.Component<{
        children: any;
    }>;
};
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
export declare function createApp(appConfig: AppConfig): EluxApp;
//# sourceMappingURL=index.d.ts.map