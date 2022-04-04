import {h, HTMLAttributes, VNode, Events, DefineComponent} from 'vue';
import {RouteTarget, RouteAction, coreConfig} from '@elux/core';
import {urlToNativeUrl} from '@elux/route';

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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Link: DefineComponent<LinkProps> = function (
  {onClick: _onClick, disabled, to = '', target = 'page', action = 'push', ...props}: LinkProps,
  context: {slots: {default?: () => VNode[]}}
) {
  const router: {[m: string]: Function} = coreConfig.UseRouter!() as any;
  const onClick = (event: Events['onClick']) => {
    event.preventDefault();
    if (!disabled) {
      _onClick && _onClick(event);
      to && router[action](action === 'back' ? parseInt(to) : {url: to}, target);
    }
  };
  props['onClick'] = onClick;
  props['action'] = action;
  props['target'] = target;
  props['to'] = to;
  disabled && (props['disabled'] = true);
  let href = action !== 'back' ? to : '';
  if (href) {
    href = urlToNativeUrl(href);
  } else {
    href = '#';
  }
  props['href'] = href;
  return h('a', props, context.slots.default!());
} as any;
