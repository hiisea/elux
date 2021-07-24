import { h, inject } from 'vue';
import { EluxContextKey } from './base';

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export default function (props, context) {
  const {
    router
  } = inject(EluxContextKey, {
    documentHead: ''
  });
  const {
    onClick,
    replace,
    ...rest
  } = props;
  const {
    target
  } = rest;
  const newProps = { ...rest,
    onClick: event => {
      try {
        onClick && onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (!event.defaultPrevented && event.button === 0 && (!target || target === '_self') && !isModifiedEvent(event)) {
          event.preventDefault();
          replace ? router.replace(rest.href) : router.push(rest.href);
        }
    }
  };
  return h('a', newProps, context.slots);
}