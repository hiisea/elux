import { h } from 'vue';
import { coreConfig } from '@elux/core';
import { urlToNativeUrl } from '@elux/route';
export const Link = function ({
  onClick: _onClick,
  disabled,
  to = '',
  target = 'page',
  action = 'push',
  ...props
}, context) {
  const router = coreConfig.UseRouter();

  const onClick = event => {
    event.preventDefault();

    if (!disabled) {
      _onClick && _onClick(event);
      to && router[action](action === 'back' ? parseInt(to) : {
        url: to
      }, target);
    }
  };

  props['onClick'] = onClick;
  props['action'] = action;
  props['target'] = target;
  props['to'] = to;
  disabled && (props['disabled'] = true);
  let href = action !== 'back' ? to : '';

  if (href) {
    href = urlToNativeUrl(href);
  } else {
    href = '#';
  }

  props['href'] = href;

  if (coreConfig.Platform === 'taro') {
    return h('span', props, context.slots.default());
  } else {
    return h('a', props, context.slots.default());
  }
};