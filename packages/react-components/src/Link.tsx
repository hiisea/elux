import React, {useCallback} from 'react';

import {coreConfig, RouteAction, RouteTarget} from '@elux/core';
import {urlToNativeUrl} from '@elux/route';

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
  action?: RouteAction;
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
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({onClick: _onClick, disabled, to = '', target = 'page', action = 'push', ...props}, ref) => {
    const router: {[m: string]: Function} = coreConfig.UseRouter!() as any;
    const onClick = useCallback(
      (event: React.MouseEvent) => {
        event.preventDefault();
        if (!disabled) {
          _onClick && _onClick(event);
          to && router[action](action === 'back' ? parseInt(to) : {url: to}, target);
        }
      },
      [_onClick, disabled, to, router, action, target]
    );
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
    return <a {...props} ref={ref} />;
  }
);
