import {defineComponent, FunctionalComponent, Events, h, HTMLAttributes, computed} from 'vue';

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
export interface LinkProps extends HTMLAttributes {
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
  onClick?(event: Events['onClick']): void;
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
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Link: FunctionalComponent<LinkProps> = defineComponent({
  // eslint-disable-next-line vue/require-prop-types
  props: ['disabled', 'to', 'onClick', 'action', 'target', 'payload', 'classname'],
  setup(props: LinkProps, context) {
    const route = computed(() => {
      const {to = '', action = 'push', classname = ''} = props;
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
    });
    const router: {[m: string]: Function} = coreConfig.UseRouter!() as any;
    const onClick = (event: Events['onClick']) => {
      event.preventDefault();
      const {back, url} = route.value;
      const {disabled, onClick, action = 'push', target = 'page', payload} = props;
      if (!disabled) {
        onClick && onClick(event);
        router[action](back || {url}, target, payload);
      }
    };
    return () => {
      const {back, url, href} = route.value;
      const {disabled, action = 'push', target = 'page', classname = ''} = props;
      const linkProps = {};
      linkProps['onClick'] = onClick;
      linkProps['action'] = action;
      linkProps['target'] = target;
      linkProps['to'] = (back || url) + '';
      linkProps['href'] = href;
      href && (linkProps['href'] = href);
      classname && (linkProps['classname'] = classname);
      disabled && (linkProps['disabled'] = true);
      if (coreConfig.Platform === 'taro') {
        return h('span', linkProps, context.slots);
      } else {
        return h('a', linkProps, context.slots);
      }
    };
  },
}) as any;
