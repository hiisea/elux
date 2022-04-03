import { h } from 'vue';
import { coreConfig } from '@elux/core';
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

  const href = action !== 'back' ? to : '';
  props['onClick'] = onClick;
  props['action'] = action;
  props['target'] = target;
  props['to'] = to;
  disabled && (props['disabled'] = true);
  href && (props['href'] = href);

  if (href) {
    return h('a', props, context.slots.default());
  } else {
    return h('div', props, context.slots.default());
  }
};