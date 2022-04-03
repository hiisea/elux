import React, {useCallback} from 'react';
import {RouteTarget, RouteAction, coreConfig} from '@elux/core';

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
    //TODO showHref 使用toNativeUrl转换
    const href = action !== 'back' ? to : '';
    props['onClick'] = onClick;
    props['action'] = action;
    props['target'] = target;
    props['to'] = to;
    disabled && (props['disabled'] = true);
    href && (props['href'] = href);

    if (href) {
      return <a {...props} ref={ref} />;
    } else {
      return <div {...props} ref={ref} />;
    }
  }
);
