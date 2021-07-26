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
    replace,
    ...rest
  } = props;
  const newProps = { ...rest,
    onClick: event => {
      event.preventDefault();
      onClick && onClick(event);
      replace ? router.replace(url) : router.push(url);
    }
  };

  if (href) {
    return h('a', newProps, context.slots);
  } else {
    return h('div', newProps, context.slots);
  }
}