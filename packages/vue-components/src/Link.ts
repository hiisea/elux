import {h, HTMLAttributes, inject, VNode, Events, DefineComponent} from 'vue';
import {EluxContext, EluxContextKey} from './base';

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
  route?: string;
  /**
   * href属性仅用于SSR时提供给搜索引擎爬取，指定跳转的url请使用 {@link LinkProps.route} 替代
   */
  href?: string;
  onClick?(event: Events['onClick']): void;
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
 * 内置VUE组件
 *
 * @remarks
 * 参见：{@link LinkProps}
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Link: DefineComponent<LinkProps> = function (
  {onClick: _onClick, disabled, href, route, action = 'push', root, ...props}: LinkProps,
  context: {slots: {default?: () => VNode[]}}
) {
  const {router} = inject<EluxContext>(EluxContextKey, {documentHead: ''});
  const onClick = (event: Events['onClick']) => {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router![action](route, root);
  };
  !disabled && (props['onClick'] = onClick);
  disabled && (props['disabled'] = true);
  !disabled && href && (props['href'] = href);
  route && (props['route'] = route);
  action && (props['action'] = action);
  root && (props['target'] = 'root');

  if (href) {
    return h('a', props, context.slots.default!());
  } else {
    return h('div', props, context.slots.default!());
  }
} as any;
