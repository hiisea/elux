import {FunctionalComponent, Events, h, HTMLAttributes, VNode} from 'vue';

import {coreConfig, RouteAction, RouteTarget} from '@elux/core';
import {urlToNativeUrl} from '@elux/route';

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
   * 如果disabled将不执行路由及onClick事件
   */
  disabled?: boolean;
  /**
   * 指定跳转的url或后退步数
   */
  to?: string;
  /**
   * 点击事件
   */
  onClick?(event: Events['onClick']): void;
  /**
   * 路由跳转动作
   */
  action?: Exclude<RouteAction, 'init'>;
  /**
   * 指定要操作的历史栈
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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Link: FunctionalComponent<LinkProps> = function (
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
  if (coreConfig.Platform === 'taro') {
    return h('span', props, context.slots.default!());
  } else {
    return h('a', props, context.slots.default!());
  }
} as any;
