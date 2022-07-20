import { AppConfig } from '@elux/app';
export { DocumentHead, Else, Link, Switch } from '@elux/react-components';
export type { DocumentHeadProps, ElseProps, LinkProps, SwitchProps } from '@elux/react-components';
export { connectRedux, connectStore, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
export type { GetProps, InferableComponentEnhancerWithProps } from '@elux/react-redux';
export * from '@elux/app';
/**
 * 小程序Page页面
 *
 * @public
 */
export declare const EluxPage: Elux.Component;
/**
 * 创建应用
 *
 * @param appConfig - 应用配置
 *
 * @returns
 * 返回包含Provider组件
 *
 * @example
 * ```js
 * render () {
 *   const Provider = createApp(appConfig);
 *   return <Provider>{this.props.children}</Provider>
 * }
 * ```
 *
 * @public
 */
export declare function createApp(appConfig: AppConfig): Elux.Component<{
    children: any;
}>;
//# sourceMappingURL=index.d.ts.map