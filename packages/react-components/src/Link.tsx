import {coreConfig, IRouteRecord, Location, RouteAction, RouteTarget, urlToNativeUrl} from '@elux/core';
import {FC, HTMLAttributes, MouseEvent, useCallback, useMemo, useRef} from 'react';

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
  to: number | string | ((record: IRouteRecord) => boolean) | Partial<Location>;
  /**
   * 路由跳转动作
   */
  action: Exclude<RouteAction, 'init'>;
  /**
   * 指定要操作的历史栈，默认`page`
   */
  target?: RouteTarget;
  /**
   * 指定路由窗口的class
   */
  cname?: string;
  /**
   * 如果disabled将不执行路由及onClick事件
   */
  disabled?: boolean;
  /**
   * 是否强制刷新dom，默认false
   */
  refresh?: boolean;
  /**
   * 点击事件
   */
  onClick?(event: MouseEvent): void;
  /**
   * 路由后退时如果溢出，将重定向到此Url
   */
  overflowRedirect?: string;
}

/**
 * 内置UI组件
 *
 * @remarks
 * 参见：{@link LinkProps}
 *
 * @public
 */
export const Link: FC<LinkProps> = ({to, cname, action, onClick, disabled, overflowRedirect, target = 'page', refresh, ...props}) => {
  const router = coreConfig.UseRouter!();
  const {firstArg, url, href} = useMemo(() => {
    let firstArg: any, url: string, href: string;
    if (action === 'back') {
      firstArg = to;
      url = `#${to.toString()}`;
      href = `#`;
    } else {
      const location = (typeof to === 'string' ? {url: to} : to) as Partial<Location>;
      cname !== undefined && (location.classname = cname);
      url = router.computeUrl(location, action, target);
      firstArg = location;
      href = urlToNativeUrl(url);
    }
    return {firstArg, url, href};
  }, [target, action, cname, router, to]);

  const data = {router, onClick, disabled, firstArg, action, target, refresh, overflowRedirect};
  const refData = useRef(data);
  Object.assign(refData.current, data);

  const clickHandler = useCallback((event: MouseEvent) => {
    event.preventDefault();
    const {router, disabled, onClick, firstArg, action, target, refresh, overflowRedirect} = refData.current;
    if (!disabled) {
      onClick && onClick(event);
      (router as any)[action](firstArg, target, refresh, overflowRedirect);
    }
  }, []);

  props['onClick'] = clickHandler;
  props['action'] = action;
  props['target'] = target;
  props['url'] = url;
  props['href'] = href;
  overflowRedirect && (props['overflow'] = overflowRedirect);
  disabled && (props['disabled'] = true);

  if (coreConfig.Platform === 'taro') {
    return <span {...props} />;
  } else {
    return <a {...props} />;
  }
};

Link.displayName = 'EluxLink';
