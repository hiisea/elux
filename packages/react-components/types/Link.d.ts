import React from 'react';
import { RouteAction, RouteTarget } from '@elux/core';
/**
 * 内置UI组件
 *
 * @remarks
 * 类似于Html标签 `<a>`，用组件的方式执行路由切换，参见 {@link IRouter}
 *
 * @example
 * ```html
 *<Link disabled={pagename==='/home'} to='/home' action='push' target='window'>home</Link>
 * ```
 *
 * @public
 */
export interface LinkProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * 是否 disable
     */
    disabled?: boolean;
    /**
     * 指定跳转的url或后退步数
     */
    to?: string;
    /**
     * 点击事件
     */
    onClick?(event: React.MouseEvent): void;
    /**
     * 指定路由的切换方式
     */
    action?: Exclude<RouteAction, 'init'>;
    /**
     * 指定要操作的路由栈
     */
    target?: RouteTarget;
}
/**
 * 内置UI组件
 *
 * @remarks
 * 参见：{@link LinkProps}
 *
 * @public
 */
export declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
//# sourceMappingURL=Link.d.ts.map