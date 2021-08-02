import {h, HTMLAttributes, inject} from 'vue';
import {EluxContext, EluxContextKey} from './base';

type MouseEvent = any;

export interface Props extends HTMLAttributes {
  url: string;
  onClick?(event: MouseEvent): void;
  href?: string;
  replace?: boolean;
  portal?: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function (props: Props, context: {slots: any}) {
  const {router} = inject<EluxContext>(EluxContextKey, {documentHead: ''});
  const {onClick, href, url, replace, portal, ...rest} = props;
  const newProps = {
    ...rest,
    onClick: (event: MouseEvent) => {
      event.preventDefault();
      onClick && onClick(event);
      replace ? router!.replace(url, portal) : router!.push(url, portal);
    },
  };
  if (href) {
    return h('a', newProps, context.slots);
  } else {
    return h('div', newProps, context.slots);
  }
}
