import {coreConfig, RouteAction, RouteTarget} from '@elux/core';
import {locationToUrl, urlToNativeUrl} from '@elux/route';
import {FC, HTMLAttributes, MouseEvent, useCallback, useMemo} from 'react';

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
   * @deprecated 指定路由窗口的class，即将废弃，请使用`cname`
   */
  classname?: string;
  /**
   * 指定路由窗口的class
   */
  cname?: string;
}

/**
 * 内置UI组件
 *
 * @remarks
 * 参见：{@link LinkProps}
 *
 * @public
 */
export const Link: FC<LinkProps> = ({
  onClick: _onClick,
  disabled,
  to = '',
  action = 'push',
  classname = '',
  cname = '',
  target = 'page',
  payload,
  ...props
}) => {
  cname = cname || classname;
  const {back, url, href} = useMemo(() => {
    let back: string | number | undefined;
    let url: string | undefined;
    let href: string | undefined;
    if (action === 'back') {
      back = to || 1;
    } else {
      url = cname ? locationToUrl({url: to.toString(), classname: cname}) : to.toString();
      href = urlToNativeUrl(url);
    }
    return {back, url, href};
  }, [action, cname, to]);
  const router: {[m: string]: Function} = coreConfig.UseRouter!() as any;
  const onClick = useCallback(
    (event: MouseEvent) => {
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
  cname && (props['cname'] = cname);
  disabled && (props['disabled'] = true);

  if (coreConfig.Platform === 'taro') {
    return <span {...props} />;
  } else {
    return <a {...props} />;
  }
};

Link.displayName = 'EluxLink';
