import { IRouteRecord, Location, RouteAction, RouteTarget } from '@elux/core';
import { Events, FunctionalComponent, HTMLAttributes } from 'vue';
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
export interface LinkProps extends HTMLAttributes {
    /**
     * 指定跳转的url或后退步数
     */
    to: number | string | ((record: IRouteRecord) => boolean) | Partial<Location>;
    /**
     * 路由跳转动作
     */
    action: Exclude<RouteAction, 'init'>;
    /**
     * 指定要操作的历史栈
     */
    target: RouteTarget | 'singleWindow';
    /**
     * 指定路由窗口的class
     */
    cname?: string;
    /**
     * 如果disabled将不执行路由及onClick事件
     */
    disabled?: boolean;
    /**
     * 点击事件
     */
    onClick?(event: Events['onClick']): void;
    /**
     * 路由后退时如果溢出，将重定向到此Url
     */
    overflowRedirect?: string;
    /**
     * 本次路由传值
     */
    payload?: any;
}
/**
 * 内置UI组件
 *
 * @remarks
 * 参见：{@link LinkProps}
 *
 * @public
 */
export declare const Link: FunctionalComponent<LinkProps>;
//# sourceMappingURL=Link.d.ts.map