import { defineComponent, h, computed } from 'vue';
import { coreConfig } from '@elux/core';
import { urlToNativeUrl, locationToUrl } from '@elux/route';
export var Link = defineComponent({
  props: ['disabled', 'to', 'onClick', 'action', 'target', 'payload', 'classname'],
  setup: function setup(props, context) {
    var route = computed(function () {
      var _props$to = props.to,
          to = _props$to === void 0 ? '' : _props$to,
          _props$action = props.action,
          action = _props$action === void 0 ? 'push' : _props$action,
          _props$classname = props.classname,
          classname = _props$classname === void 0 ? '' : _props$classname;
      var back;
      var url;
      var href;

      if (action === 'back') {
        back = to || 1;
      } else {
        url = classname ? locationToUrl({
          url: to.toString(),
          classname: classname
        }) : to.toString();
        href = urlToNativeUrl(url);
      }

      return {
        back: back,
        url: url,
        href: href
      };
    });
    var router = coreConfig.UseRouter();

    var onClick = function onClick(event) {
      event.preventDefault();
      var _route$value = route.value,
          back = _route$value.back,
          url = _route$value.url;
      var disabled = props.disabled,
          onClick = props.onClick,
          _props$action2 = props.action,
          action = _props$action2 === void 0 ? 'push' : _props$action2,
          _props$target = props.target,
          target = _props$target === void 0 ? 'page' : _props$target,
          payload = props.payload;

      if (!disabled) {
        onClick && onClick(event);
        router[action](back || {
          url: url
        }, target, payload);
      }
    };

    return function () {
      var _route$value2 = route.value,
          back = _route$value2.back,
          url = _route$value2.url,
          href = _route$value2.href;
      var disabled = props.disabled,
          _props$action3 = props.action,
          action = _props$action3 === void 0 ? 'push' : _props$action3,
          _props$target2 = props.target,
          target = _props$target2 === void 0 ? 'page' : _props$target2,
          _props$classname2 = props.classname,
          classname = _props$classname2 === void 0 ? '' : _props$classname2;
      var linkProps = {};
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