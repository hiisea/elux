import { AppConfig } from '@elux/app';
import { App } from 'vue';
export { DocumentHead, Else, Link, Switch } from '@elux/vue-components';
export type { DocumentHeadProps, ElseProps, LinkProps, SwitchProps } from '@elux/vue-components';
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
 * @remarks
 * 应用唯一的创建入口
 *
 * @param appConfig - 应用配置
 * @param appOptions - 应用生命周期钩子
 *
 * @returns
 * 返回Vue实例
 *
 * @example
 * ```js
 * createApp(config, {
 *  onLaunch(){
 *  }
 * })
 * ```
 *
 * @public
 */
export declare function createApp(appConfig: AppConfig, appOptions?: Record<string, any>): App;
//# sourceMappingURL=index.d.ts.map