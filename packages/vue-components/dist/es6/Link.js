import { coreConfig } from '@elux/core';
import { urlToNativeUrl } from '@elux/route';
import { computed, defineComponent, h } from 'vue';
export const Link = defineComponent({
  name: 'EluxLink',
  props: ['disabled', 'to', 'onClick', 'action', 'target', 'refresh', 'cname', 'overflowRedirect'],

  setup(props, context) {
    const router = coreConfig.UseRouter();
    const route = computed(() => {
      let firstArg, url, href;
      const {
        to,
        action,
        cname,
        target
      } = props;

      if (action === 'back') {
        firstArg = to;
        url = `#${to.toString()}`;
        href = `#`;
      } else {
        const location = typeof to === 'string' ? {
          url: to
        } : to;
        cname !== undefined && (location.classname = cname);
        url = router.computeUrl(location, action, target);
        firstArg = {
          url
        };
        href = urlToNativeUrl(url);
      }

      return {
        firstArg,
        url,
        href
      };
    });

    const clickHandler = event => {
      event.preventDefault();
      const {
        firstArg
      } = route.value;
      const {
        disabled,
        onClick,
        action,
        target,
        refresh,
        overflowRedirect
      } = props;

      if (!disabled) {
        onClick && onClick(event);
        router[action](firstArg, target, refresh, overflowRedirect);
      }
    };

    return () => {
      const {
        url,
        href
      } = route.value;
      const {
        disabled,
        action,
        target,
        overflowRedirect
      } = props;
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
  }

});