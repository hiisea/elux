import {coreConfig, IRouteRecord, Location, RouteAction, RouteTarget} from '@elux/core';
import {urlToNativeUrl} from '@elux/route';
import {computed, defineComponent, Events, FunctionalComponent, h, HTMLAttributes} from 'vue';

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
  target: RouteTarget;
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
  onClick?(event: Events['onClick']): void;
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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Link: FunctionalComponent<LinkProps> = defineComponent({
  name: 'EluxLink',
  // eslint-disable-next-line vue/require-prop-types
  props: ['disabled', 'to', 'onClick', 'action', 'target', 'refresh', 'cname', 'overflowRedirect'],
  setup(props: LinkProps, context) {
    const router = coreConfig.UseRouter!();
    const route = computed(() => {
      let firstArg: any, url: string, href: string;
      const {to, action, cname, target} = props;
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
    });

    const clickHandler = (event: Events['onClick']) => {
      event.preventDefault();
      const {firstArg} = route.value;
      const {disabled, onClick, action, target, refresh, overflowRedirect} = props;
      if (!disabled) {
        onClick && onClick(event);
        (router as any)[action](firstArg, target, refresh, overflowRedirect);
      }
    };
    return () => {
      const {url, href} = route.value;
      const {disabled, action, target, overflowRedirect} = props;
      const linkProps = {};
      linkProps['onClick'] = clickHandler;
      linkProps['action'] = action;
      linkProps['target'] = target;
      linkProps['url'] = url;
      linkProps['href'] = href;
      overflowRedirect && (linkProps['overflow'] = overflowRedirect);
      disabled && (linkProps['disabled'] = true);

      if (coreConfig.Platform === 'taro') {
        return h('span', linkProps, context.slots);
      } else {
        return h('a', linkProps, context.slots);
      }
    };
  },
}) as any;
