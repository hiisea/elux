import { env, isServer } from '@elux/core';
import { inject } from 'vue';
import { EluxContextKey } from '../sington';
let clientTimer = 0;

function setClientHead({
  documentHead
}) {
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

export default function ({
  children
}) {
  const eluxContext = inject(EluxContextKey, {
    documentHead: ''
  });
  eluxContext.documentHead = children;

  if (!isServer()) {
    setClientHead(eluxContext);
  }

  return null;
}