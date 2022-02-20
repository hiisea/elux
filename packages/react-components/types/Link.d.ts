import React from 'react';
/**
 * 内置React组件
 *
 * @remarks
 * 类似于Html标签 `<a>`
 *
 * @example
 * ```html
 *<Link disabled={pagename==='/home'} route='/home' href='/home' action='push' root>home</Link>
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
     * 指定跳转的url，支持{@link EluxLocation | 3种路由协议}：eluxUrl [`e://...`]，nativeUrl [`n://...`]，stateUrl [`s://...`]
     */
    route?: string;
    /**
     * href属性仅用于SSR时提供给搜索引擎爬取，指定跳转的url请使用 {@link LinkProps.route} 替代
     */
    href?: string;
    onClick?(event: React.MouseEvent): void;
    /**
     * 路由的切换方式，参见 {@link RouteHistoryAction}
     */
    action?: 'push' | 'replace' | 'relaunch';
    /**
     * 是否操作顶级路由栈（EWindow栈），虚拟多页下使用
     */
    root?: boolean;
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