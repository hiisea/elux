import { h, inject } from 'vue';
import { EluxContextKey } from './base';
export default function (props, context) {
  const {
    router
  } = inject(EluxContextKey, {
    documentHead: ''
  });
  const {
    onClick,
    href,
    url,
    action = 'push',
    root,
    ...rest
  } = props;
  const newProps = { ...rest,
    onClick: event => {
      event.preventDefault();
      onClick && onClick(event);
      router[action](url, root);
    }
  };

  if (href) {
    return h('a', newProps, context.slots.default());
  } else {
    return h('div', newProps, context.slots.default());
  }
}