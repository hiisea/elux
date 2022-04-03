import React from 'react';
import { RouteTarget, RouteAction } from '@elux/core';
/**
 * 内置React组件
 *
 * @remarks
 * 类似于Html标签 `<a>`，用组件的方式执行路由切换，参见 {@link URouter}
 *
 * @example
 * ```html
 *<Link disabled={pagename==='/home'} route='/home' action='push' target='window'>home</Link>
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
    onClick?(event: React.MouseEvent): void;
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
 * 内置React组件
 *
 * @remarks
 * 参见：{@link LinkProps}
 *
 * @public
 */
export declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
//# sourceMappingURL=Link.d.ts.map