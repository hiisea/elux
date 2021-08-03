import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import { h, inject } from 'vue';
import { EluxContextKey } from './base';
export default function (props, context) {
  var _inject = inject(EluxContextKey, {
    documentHead: ''
  }),
      router = _inject.router;

  var onClick = props.onClick,
      href = props.href,
      url = props.url,
      replace = props.replace,
      portal = props.portal,
      rest = _objectWithoutPropertiesLoose(props, ["onClick", "href", "url", "replace", "portal"]);

  var newProps = _extends({}, rest, {
    onClick: function (_onClick) {
      function onClick(_x) {
        return _onClick.apply(this, arguments);
      }

      onClick.toString = function () {
        return _onClick.toString();
      };

      return onClick;
    }(function (event) {
      event.preventDefault();
      onClick && onClick(event);
      replace ? router.replace(url, portal) : router.push(url, portal);
    })
  });

  if (href) {
    return h('a', newProps, context.slots);
  } else {
    return h('div', newProps, context.slots);
  }
}