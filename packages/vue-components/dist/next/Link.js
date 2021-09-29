import { h, inject } from 'vue';
import { EluxContextKey } from './base';
export default function ({
  onClick: _onClick,
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

  props['onClick'] = event => {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router[action](route, root);
  };

  if (href) {
    return h('a', props, context.slots.default());
  } else {
    return h('div', props, context.slots.default());
  }
}