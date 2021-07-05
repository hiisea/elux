import {env, isServer} from '@elux/core';
import {inject} from 'vue';
import {EluxContextType, EluxContextKey} from '../sington';

export interface Props {
  html: string;
}

let clientTimer = 0;

function setClientHead({documentHead}: {documentHead: string}) {
  if (!clientTimer) {
    clientTimer = env.setTimeout(() => {
      clientTimer = 0;
      const arr = documentHead.match(/<title>(.*)<\/title>/) || [];
      if (arr[1]) {
        env.document.title = arr[1];
      }
    }, 300);
  }
}

export default function ({html}: Props) {
  const eluxContext = inject<EluxContextType>(EluxContextKey, {documentHead: ''});
  eluxContext.documentHead = html;
  if (!isServer()) {
    setClientHead(eluxContext);
  }
  return null;
}
