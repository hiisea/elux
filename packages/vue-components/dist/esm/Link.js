import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["onClick", "href", "route", "action", "root"];
import { h, inject } from 'vue';
import { EluxContextKey } from './base';
export default function (_ref, context) {
  var _onClick = _ref.onClick,
      href = _ref.href,
      route = _ref.route,
      _ref$action = _ref.action,
      action = _ref$action === void 0 ? 'push' : _ref$action,
      root = _ref.root,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);

  var _inject = inject(EluxContextKey, {
    documentHead: ''
  }),
      router = _inject.router;

  props['onClick'] = function (event) {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router[action](route, root);
  };

  href && (props['href'] = href);
  route && (props['route'] = route);
  action && (props['action'] = action);
  root && (props['target'] = 'root');

  if (href) {
    return h('a', props, context.slots.default());
  } else {
    return h('div', props, context.slots.default());
  }
}