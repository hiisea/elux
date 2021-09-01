import {h, HTMLAttributes, inject, VNode} from 'vue';
import {EluxContext, EluxContextKey} from './base';

type MouseEvent = any;

export interface Props extends HTMLAttributes {
  url: string;
  onClick?(event: MouseEvent): void;
  href?: string;
  action?: 'push' | 'replace' | 'relaunch';
  root?: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function (props: Props, context: {slots: {default?: () => VNode[]}}) {
  const {router} = inject<EluxContext>(EluxContextKey, {documentHead: ''});
  const {onClick, href, url, action = 'push', root, ...rest} = props;
  const newProps = {
    ...rest,
    onClick: (event: MouseEvent) => {
      event.preventDefault();
      onClick && onClick(event);
      router![action](url, root);
    },
  };
  if (href) {
    return h('a', newProps, context.slots.default!());
  } else {
    return h('div', newProps, context.slots.default!());
  }
}
