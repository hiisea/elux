import { h } from 'vue';
import { MetaData } from '../sington';

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export default function (props, context) {
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
          replace ? MetaData.router.replace(rest.href) : MetaData.router.push(rest.href);
        }
    }
  };
  return h('a', newProps, context.slots);
}