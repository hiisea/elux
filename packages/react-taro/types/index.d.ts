import { AppConfig } from '@elux/app';
import { IStore } from '@elux/core';
export { DocumentHead, Else, EWindow, Link, Switch } from '@elux/react-components';
export type { DocumentHeadProps, ElseProps, LinkProps, SwitchProps } from '@elux/react-components';
export { connectRedux, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
export type { GetProps, InferableComponentEnhancerWithProps } from '@elux/react-redux';
export * from '@elux/app';
/**
 * 在小程序Page中获取Store
 *
 * @public
 */
export declare function useCurrentStore(): IStore | undefined;
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
 * @param appConfig - 应用配置
 *
 * @returns
 * 返回包含`render`方法的实例
 *
 * @example
 * ```js
 * render () {
 *   const Provider = createApp(appConfig).render();
 *   return <Provider>{this.props.children}</Provider>
 * }
 * ```
 *
 * @public
 */
export declare function createApp(appConfig: AppConfig): EluxApp;
//# sourceMappingURL=index.d.ts.map