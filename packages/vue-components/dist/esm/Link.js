import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import { h, inject } from 'vue';
import { EluxContextKey } from './base';

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export default function (props, context) {
  var _inject = inject(EluxContextKey, {
    documentHead: ''
  }),
      router = _inject.router;

  var _onClick = props.onClick,
      replace = props.replace,
      rest = _objectWithoutPropertiesLoose(props, ["onClick", "replace"]);

  var target = rest.target;

  var newProps = _extends({}, rest, {
    onClick: function onClick(event) {
      try {
        _onClick && _onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (!event.defaultPrevented && event.button === 0 && (!target || target === '_self') && !isModifiedEvent(event)) {
          event.preventDefault();
          replace ? router.replace(rest.href) : router.push(rest.href);
        }
    }
  });

  return h('a', newProps, context.slots);
}