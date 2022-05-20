import React, {useCallback, useMemo} from 'react';

import {coreConfig, RouteAction, RouteTarget} from '@elux/core';
import {urlToNativeUrl, locationToUrl} from '@elux/route';

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
export interface LinkProps extends React.HTMLAttributes<HTMLDivElement> {
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
  onClick?(event: React.MouseEvent): void;
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
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({onClick: _onClick, disabled, to = '', action = 'push', classname = '', target = 'page', payload, ...props}, ref) => {
    const {back, url, href} = useMemo(() => {
      let back: string | number | undefined;
      let url: string | undefined;
      let href: string | undefined;
      if (action === 'back') {
        back = to || 1;
      } else {
        url = classname ? locationToUrl({url: to.toString(), classname}) : to.toString();
        href = urlToNativeUrl(url);
      }
      return {back, url, href};
    }, [action, classname, to]);
    const router: {[m: string]: Function} = coreConfig.UseRouter!() as any;
    const onClick = useCallback(
      (event: React.MouseEvent) => {
        event.preventDefault();
        if (!disabled) {
          _onClick && _onClick(event);
          router[action](back || {url}, target, payload);
        }
      },
      [disabled, _onClick, router, action, back, url, target, payload]
    );
    props['onClick'] = onClick;
    props['action'] = action;
    props['target'] = target;
    props['to'] = (back || url) + '';
    props['href'] = href;
    href && (props['href'] = href);
    classname && (props['classname'] = classname);
    disabled && (props['disabled'] = true);

    if (coreConfig.Platform === 'taro') {
      return <span {...props} ref={ref} />;
    } else {
      return <a {...props} ref={ref} />;
    }
  }
);
