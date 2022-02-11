import {h, HTMLAttributes, inject, VNode, Events} from 'vue';
import {EluxContext, EluxContextKey} from './base';

/*** @public */
export interface LinkProps extends HTMLAttributes {
  disabled?: boolean;
  route?: string;
  onClick?(event: Events['onClick']): void;
  href?: string;
  action?: 'push' | 'replace' | 'relaunch';
  root?: boolean;
}

/*** @public */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function (
  {onClick: _onClick, disabled, href, route, action = 'push', root, ...props}: LinkProps,
  context: {slots: {default?: () => VNode[]}}
) {
  const {router} = inject<EluxContext>(EluxContextKey, {documentHead: ''});
  const onClick = (event: Events['onClick']) => {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router![action](route, root);
  };
  !disabled && (props['onClick'] = onClick);
  disabled && (props['disabled'] = true);
  !disabled && href && (props['href'] = href);
  route && (props['route'] = route);
  action && (props['action'] = action);
  root && (props['target'] = 'root');

  if (href) {
    return h('a', props, context.slots.default!());
  } else {
    return h('div', props, context.slots.default!());
  }
}
