import { h, inject } from 'vue';
import { EluxContextKey } from './base';
export default function ({
  onClick: _onClick,
  disabled,
  href,
  route,
  action = 'push',
  root,
  ...props
}, context) {
  const {
    router
  } = inject(EluxContextKey, {
    documentHead: ''
  });

  const onClick = event => {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router[action](route, root);
  };

  !disabled && (props['onClick'] = onClick);
  disabled && (props['disabled'] = true);
  !disabled && href && (props['href'] = href);
  route && (props['route'] = route);
  action && (props['action'] = action);
  root && (props['target'] = 'root');

  if (href) {
    return h('a', props, context.slots.default());
  } else {
    return h('div', props, context.slots.default());
  }
}