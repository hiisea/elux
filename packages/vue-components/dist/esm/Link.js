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
      route = props.route,
      _props$action = props.action,
      action = _props$action === void 0 ? 'push' : _props$action,
      root = props.root,
      rest = _objectWithoutPropertiesLoose(props, ["onClick", "href", "route", "action", "root"]);

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
      router[action](route, root);
    })
  });

  if (href) {
    return h('a', newProps, context.slots.default());
  } else {
    return h('div', newProps, context.slots.default());
  }
}