import { HTMLAttributes, Events, DefineComponent } from 'vue';
import { RouteTarget, RouteAction } from '@elux/core';
/**
 * 内置VUE组件
 *
 * @remarks
 * 类似于Html标签 `<a>`，用组件的方式执行路由切换，参见 {@link URouter}
 *
 * @example
 * ```html
 *<Link disabled={pagename==='/home'} route='/home' href='/home' action='push' root>home</Link>
 * ```
 *
 * @public
 */
export interface LinkProps extends HTMLAttributes {
    /**
     * 是否 disable
     */
    disabled?: boolean;
    /**
     * 指定跳转的url，支持{@link EluxLocation | 3种路由协议}：eluxUrl [`e://...`]，nativeUrl [`n://...`]，stateUrl [`s://...`]
     */
    to?: string;
    onClick?(event: Events['onClick']): void;
    /**
     * 路由的切换方式，参见 {@link RouteHistoryAction}
     */
    action?: RouteAction;
    /**
     * 是否操作顶级路由栈（EWindow栈），虚拟多页下使用
     */
    target?: RouteTarget;
}
/**
 * 内置VUE组件
 *
 * @remarks
 * 参见：{@link LinkProps}
 *
 * @public
 */
export declare const Link: DefineComponent<LinkProps>;
//# sourceMappingURL=Link.d.ts.map