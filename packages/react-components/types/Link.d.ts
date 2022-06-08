import { RouteAction, RouteTarget } from '@elux/core';
import { FC, HTMLAttributes, MouseEvent } from 'react';
/**
 * 内置UI组件
 *
 * @remarks
 * 类似于Html标签`<a>`，用组件的方式执行路由跳转，参见 {@link IRouter}
 *
 * @example
 * ```html
 *<Link disabled={pagename==='/home'} to='/home' action='push' target='window'>home</Link>
 * ```
 *
 * @public
 */
export interface LinkProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * 指定跳转的url或后退步数
     */
    to: number | string;
    /**
     * 如果disabled将不执行路由及onClick事件
     */
    disabled?: boolean;
    /**
     * 点击事件
     */
    onClick?(event: MouseEvent): void;
    /**
     * 路由跳转动作
     */
    action?: Exclude<RouteAction, 'init'>;
    /**
     * 指定要操作的历史栈
     */
    target?: RouteTarget;
    /**
     * 本次路由传值
     */
    payload?: any;
    /**
     * 指定路由窗口的class
     */
    classname?: string;
}
/**
 * 内置UI组件
 *
 * @remarks
 * 参见：{@link LinkProps}
 *
 * @public
 */
export declare const Link: FC<LinkProps>;
//# sourceMappingURL=Link.d.ts.map