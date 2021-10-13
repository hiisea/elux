import {h, HTMLAttributes, inject, VNode} from 'vue';
import {EluxContext, EluxContextKey} from './base';

type MouseEvent = any;

export interface Props extends HTMLAttributes {
  route?: string;
  onClick?(event: MouseEvent): void;
  href?: string;
  action?: 'push' | 'replace' | 'relaunch';
  root?: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function ({onClick: _onClick, href, route, action = 'push', root, ...props}: Props, context: {slots: {default?: () => VNode[]}}) {
  const {router} = inject<EluxContext>(EluxContextKey, {documentHead: ''});
  props['onClick'] = (event: MouseEvent) => {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router![action](route, root);
  };
  href && (props['href'] = href);
  route && (props['route'] = route);
  action && (props['action'] = action);
  root && (props['target'] = 'root');

  if (href) {
    return h('a', props, context.slots.default!());
  } else {
    return h('div', props, context.slots.default!());
  }
}
