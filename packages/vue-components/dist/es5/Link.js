import { coreConfig } from '@elux/core';
import { urlToNativeUrl } from '@elux/route';
import { computed, defineComponent, h } from 'vue';
export var Link = defineComponent({
  name: 'EluxLink',
  props: ['disabled', 'to', 'onClick', 'action', 'target', 'payload', 'cname', 'overflowRedirect'],
  setup: function setup(props, context) {
    var router = coreConfig.UseRouter();
    var route = computed(function () {
      var firstArg, url, href;
      var to = props.to,
          action = props.action,
          cname = props.cname,
          target = props.target;

      if (action === 'back') {
        firstArg = to;
        url = "#" + to.toString();
        href = "#";
      } else {
        var location = typeof to === 'string' ? {
          url: to
        } : to;
        cname !== undefined && (location.classname = cname);
        url = router.computeUrl(location, action, target);
        firstArg = {
          url: url
        };
        href = urlToNativeUrl(url);
      }

      return {
        firstArg: firstArg,
        url: url,
        href: href
      };
    });

    var clickHandler = function clickHandler(event) {
      event.preventDefault();
      var firstArg = route.value.firstArg;
      var disabled = props.disabled,
          onClick = props.onClick,
          action = props.action,
          target = props.target,
          payload = props.payload,
          overflowRedirect = props.overflowRedirect;

      if (!disabled) {
        onClick && onClick(event);
        router[action](firstArg, target, payload, overflowRedirect);
      }
    };

    return function () {
      var _route$value = route.value,
          url = _route$value.url,
          href = _route$value.href;
      var disabled = props.disabled,
          action = props.action,
          target = props.target,
          overflowRedirect = props.overflowRedirect;
      var linkProps = {};
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