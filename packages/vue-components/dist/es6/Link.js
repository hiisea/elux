import { defineComponent, h, computed } from 'vue';
import { coreConfig } from '@elux/core';
import { urlToNativeUrl, locationToUrl } from '@elux/route';
export const Link = defineComponent({
  props: ['disabled', 'to', 'onClick', 'action', 'target', 'payload', 'classname'],

  setup(props, context) {
    const route = computed(() => {
      const {
        to = '',
        action = 'push',
        classname = ''
      } = props;
      let back;
      let url;
      let href;

      if (action === 'back') {
        back = to || 1;
      } else {
        url = classname ? locationToUrl({
          url: to.toString(),
          classname
        }) : to.toString();
        href = urlToNativeUrl(url);
      }

      return {
        back,
        url,
        href
      };
    });
    const router = coreConfig.UseRouter();

    const onClick = event => {
      event.preventDefault();
      const {
        back,
        url
      } = route.value;
      const {
        disabled,
        onClick,
        action = 'push',
        target = 'page',
        payload
      } = props;

      if (!disabled) {
        onClick && onClick(event);
        router[action](back || {
          url
        }, target, payload);
      }
    };

    return () => {
      const {
        back,
        url,
        href
      } = route.value;
      const {
        disabled,
        action = 'push',
        target = 'page',
        classname = ''
      } = props;
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
  }

});